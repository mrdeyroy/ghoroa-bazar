import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import socket from "../utils/socket";
import { BASE_URL } from "../config/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token, logout } = useAuth();

  const toastTimerRef = useRef(null);
  const processedIdsRef = useRef(new Set()); 

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

  // ── Mark single notification as read ──
  const markAsRead = useCallback(async (id) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const activeToken = adminToken || token;
      
      const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [token]);

  // ── Mark all as read ──
  const markAllRead = useCallback(async () => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    const adminToken = localStorage.getItem("adminToken");
    const activeToken = adminToken || token;
    const endpoint = isAdmin ? "/api/notifications/admin/read-all" : "/api/notifications/read-all";
    
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, [token]);

  // ── Clear notification history (Frontend only UI reset) ──
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    processedIdsRef.current.clear();
  }, []);

  // ═══════════════════════════════════════════
  // INITIAL FETCH & SOCKET SYNC
  // ═══════════════════════════════════════════
  const prevRoleRef = useRef(null);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const isAdminMode = window.location.pathname.startsWith("/admin");
    const role = isAdminMode ? "admin" : "user";
    const activeToken = isAdminMode ? adminToken : token;
    
    // Only fetch if we have a token AND it matches the current environment
    // AND we haven't already fetched for this role/auth state (unless auth changed)
    // CRITICAL: On refresh, AuthContext takes a moment to set the 'user' state from localStorage.
    // If we fetch now (user=null) and again in 50ms (user=defined), we trigger redundant calls.
    // We only fetch once we have both the token AND the user object (unless it's an admin path).
    if (!isAdminMode && activeToken && !user) {
        return; 
    }

    if (!activeToken || (prevRoleRef.current === role && activeToken === (isAdminMode ? adminToken : token) && notifications.length > 0)) {
        return;
    }

    // Update role ref
    prevRoleRef.current = role;

    const endpoint = isAdminMode ? "/api/notifications/admin" : "/api/notifications";

    // 1. Fetch History
    fetch(`${BASE_URL}${endpoint}`, {
      headers: { "Authorization": `Bearer ${activeToken}` }
    })
      .then(res => {
        if (res.status === 401) {
          console.warn("Invalid/Expired session. Logging out...");
          logout();
          return null;
        }
        if (res.status === 429) {
          console.warn("Notifications fetch rate limited (429)");
          return null; // Don't return [] as it wipes notifications state
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          const enriched = data.map(n => ({ 
            ...n, 
            id: n._id, 
            timestamp: n.createdAt,
            icon: n.type === "stock" ? "🔥" : n.type === "broadcast" ? "📢" : "📦"
          }));
          setNotifications(enriched);
          setUnreadCount(enriched.filter(n => !n.isRead).length);
          enriched.forEach(n => processedIdsRef.current.add(n._id));
        }
      })
      .catch(err => console.error("History fetch error:", err));

    // 2. Setup Socket
    if (!socket.connected) socket.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onNewNotification = (notification) => {
      const notifId = notification._id || notification.id;
      if (!notifId || processedIdsRef.current.has(notifId)) return;

      processedIdsRef.current.add(notifId);
      const enriched = {
        ...notification,
        _id: notifId,
        id: notifId, 
        createdAt: notification.createdAt || new Date().toISOString(),
        timestamp: notification.createdAt || new Date().toISOString(),
        isRead: false,
        icon: notification.icon || (notification.type === "stock" ? "🔥" : notification.type === "broadcast" ? "📢" : "📦")
      };

      setNotifications(prev => [enriched, ...prev]);
      setUnreadCount(prev => prev + 1);
      showToast(enriched);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setIsConnected(socket.connected);

    if (isAdminMode && adminToken) {
      socket.emit("join", { role: "admin" });
      socket.on("admin:notification", onNewNotification);
    } else if (user) {
      socket.emit("join", { userId: user?._id || user?.id, role: "user" });
      socket.on("user:notification", onNewNotification);
      socket.on("orderNotification", onNewNotification); // Legacy fallback
      socket.on("broadcast:new", onNewNotification);
    }
    
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("admin:notification", onNewNotification);
      socket.off("user:notification", onNewNotification);
      socket.off("orderNotification", onNewNotification);
      socket.off("broadcast:new", onNewNotification);
    };
  }, [token, user, window.location.pathname.startsWith("/admin")]); // Only depend on admin mode change, not every path change

  const deleteNotification = useCallback(async (id) => {
    try {
      const isAdminMode = window.location.pathname.startsWith("/admin");
      const adminToken = localStorage.getItem("adminToken");
      const activeToken = isAdminMode ? adminToken : token;

      if (!activeToken) return;

      const res = await fetch(`${BASE_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${activeToken}` }
      });

      if (res.ok) {
        setNotifications(prev => {
          const target = prev.find(n => (n._id || n.id) === id);
          if (target && !target.isRead) {
            setUnreadCount(count => Math.max(0, count - 1));
          }
          return prev.filter(n => (n._id || n.id) !== id);
        });
      }
    } catch (err) {
      console.error("Delete notification failed:", err);
    }
  }, [token]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toast,
      isConnected,
      markAsRead,
      markAllRead,
      clearNotifications,
      showToast,
      dismissToast,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
