import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import socket from "../utils/socket";

const NotificationContext = createContext();

/**
 * Global notification provider.
 * 
 * - Manages socket connection lifecycle for both user and admin
 * - Listens for `orderNotification` (user) and `newOrderNotification` (admin)
 * - Provides toast queue + unread badge count to the entire app
 * - Deduplicates joins via refs; cleans up on unmount
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]); // full history
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  const toastTimerRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const processedIdsRef = useRef(new Set()); // prevent duplicate notifications

  // ── Show toast (auto-dismiss) ──
  const showToast = useCallback((notification) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(notification);
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
  }, []);

  // ── Dismiss toast manually ──
  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  // ── Mark all as read ──
  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // ── Clear notification history ──
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    processedIdsRef.current.clear();
  }, []);

  // ── Add notification (deduplicated) ──
  const addNotification = useCallback((notification) => {
    // Create a unique key to prevent duplicates
    const notifKey = `${notification.orderId}_${notification.type}_${notification.status || "new"}`;
    if (processedIdsRef.current.has(notifKey)) return;
    processedIdsRef.current.add(notifKey);

    // Keep max 50 notifications
    if (processedIdsRef.current.size > 50) {
      const first = processedIdsRef.current.values().next().value;
      processedIdsRef.current.delete(first);
    }

    const enriched = {
      ...notification,
      id: notifKey,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [enriched, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
    showToast(enriched);
  }, [showToast]);

  // ═══════════════════════════════════════════
  // RECENT ACTIVITY FETCH (PERSISTENCE SIMULATION)
  // ═══════════════════════════════════════════
  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    const isUser = token && user;

    if (isAdmin) {
      fetch(import.meta.env.VITE_API_URL + "/api/orders")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const recent = data.slice(0, 15).map(order => ({
              id: `history_${order._id}_placed`,
              orderId: order._id,
              type: "new_order",
              message: `New order from ${order.customerDetails?.firstName || 'Customer'}`,
              totalAmount: order.totalAmount,
              timestamp: order.createdAt,
              read: true,
              icon: "🔔"
            }));
            
            const cancelled = data.filter(o => o.orderStatus === "Cancelled").slice(0, 5).map(order => ({
              id: `history_${order._id}_cancelled`,
              orderId: order._id,
              message: `Order cancelled by ${order.customerDetails?.firstName || 'Customer'}`,
              totalAmount: order.totalAmount,
              timestamp: order.cancelledAt || order.createdAt,
              read: true,
              type: "order_cancelled",
              icon: "❌"
            }));

            // Stealth merge so we don't overwrite live unread notifications
            setNotifications(prev => {
              const prevMap = new Map(prev.map(n => [n.id || `${n.orderId}_${n.type}_${n.status||"new"}`, n]));
              [...recent, ...cancelled].forEach(n => {
                if (!prevMap.has(n.id) && !prevMap.has(`${n.orderId}_${n.type}_new`)) {
                  prevMap.set(n.id, n);
                }
              });
              return Array.from(prevMap.values())
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 50);
            });
          }
        })
        .catch(console.error);
    } else if (isUser) {
      fetch(import.meta.env.VITE_API_URL + "/api/orders/my", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const recent = data.slice(0, 10).map(order => {
              const statusMessages = {
                  Packed: "Your order is being packed 📦",
                  Shipped: "Your order is on the way! 🚚",
                  Delivered: "Your order has been delivered! 🎉",
                  Cancelled: "Your order has been cancelled ❌",
                  Placed: "Order successfully placed! 🛍️"
              };
              return {
                  id: `history_${order._id}_${order.orderStatus}`,
                  orderId: order._id,
                  type: "order_status",
                  status: order.orderStatus,
                  message: statusMessages[order.orderStatus] || `Order status: ${order.orderStatus}`,
                  timestamp: order.orderHistory?.[order.orderHistory?.length - 1]?.date || order.createdAt,
                  read: true,
                  icon: order.orderStatus === "Cancelled" ? "❌" : "📦"
              };
            });
            
            setNotifications(prev => {
              const prevMap = new Map(prev.map(n => [n.id || `${n.orderId}_${n.type}_${n.status||"new"}`, n]));
              recent.forEach(n => {
                if (!prevMap.has(n.id) && !prevMap.has(`${n.orderId}_${n.type}_${n.status}`)) {
                  prevMap.set(n.id, n);
                }
              });
              return Array.from(prevMap.values())
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 50);
            });
          }
        })
        .catch(console.error);
    }
  }, [token, user]);

  // ═══════════════════════════════════════════
  // SOCKET LIFECYCLE — connect, join rooms, listen
  // ═══════════════════════════════════════════
  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    const isUser = token && user;

    // Need at least one role to connect
    if (!isAdmin && !isUser) return;

    // Connect if not already
    if (!socket.connected) {
      socket.connect();
    }

    // ── Join appropriate rooms ──
    const joinRooms = () => {
      if (hasJoinedRef.current) return;
      hasJoinedRef.current = true;

      if (isUser) {
        const userId = user._id || user.id;
        if (userId) socket.emit("joinUserRoom", userId);
      }

      if (isAdmin) {
        socket.emit("joinAdminRoom");
      }
    };

    if (socket.connected) {
      joinRooms();
      setIsConnected(true);
    }

    // ── Event handlers ──
    const onConnect = () => {
      setIsConnected(true);
      hasJoinedRef.current = false;
      joinRooms();
    };

    const onDisconnect = () => {
      setIsConnected(false);
      hasJoinedRef.current = false;
    };

    // User notification: order status changed by admin
    const onOrderNotification = (data) => {
      // FIX: Don't show user-facing order update toasts if we are currently using the admin panel
      if (window.location.pathname.startsWith("/admin")) return;

      addNotification({
        ...data,
        type: "order_status",
        icon: "📦"
      });
    };

    // Admin notification: new order placed by user
    const onNewOrderNotification = (data) => {
      // FIX: Don't show admin-facing new order toasts if we are currently browsing the user storefront
      if (!window.location.pathname.startsWith("/admin")) return;

      addNotification({
        ...data,
        type: "new_order",
        icon: "🔔"
      });
    };

    // Admin notification: order cancelled by user
    const onOrderCancelled = (order) => {
      if (!window.location.pathname.startsWith("/admin")) return;
      
      const customerName = order.customerDetails?.firstName || "Customer";
      
      addNotification({
        orderId: order._id,
        message: `Order cancelled by ${customerName}`,
        totalAmount: order.totalAmount,
        type: "order_cancelled",
        icon: "❌"
      });
    };

    // ── Register ──
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    
    if (isUser) {
      socket.on("orderNotification", onOrderNotification);
    }
    if (isAdmin) {
      socket.on("newOrderNotification", onNewOrderNotification);
      socket.on("orderCancelled", onOrderCancelled);
    }

    // ── Cleanup ──
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("orderNotification", onOrderNotification);
      socket.off("newOrderNotification", onNewOrderNotification);
      socket.off("orderCancelled", onOrderCancelled);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      hasJoinedRef.current = false;
    };
  }, [token, user, addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toast,
      isConnected,
      showToast,
      dismissToast,
      markAllRead,
      clearNotifications,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
