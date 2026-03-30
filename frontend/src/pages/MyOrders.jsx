import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Truck, 
  ArrowRight, 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import BackButton from "../components/BackButton";
import socket from "../utils/socket";
import toast from "react-hot-toast";
import { BASE_URL } from "../config/api";

// Status message mapping for live tracking feel
const STATUS_MESSAGES = {
  Placed: "Your order has been placed successfully!",
  Packed: "Your order is being packed with care 📦",
  Shipped: "Your order is on the way! 🚚",
  Delivered: "Your order has been delivered! 🎉"
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [liveUpdateFlash, setLiveUpdateFlash] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { user, token } = useAuth();
  const { isConnected } = useNotifications();
  const navigate = useNavigate();

  // ── Refs for cleanup & deduplication ──
  const flashTimerRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());

  // ── Flash helper (stable — no deps) ──
  const triggerFlash = useCallback((orderId) => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setLiveUpdateFlash(orderId);
    flashTimerRef.current = setTimeout(() => setLiveUpdateFlash(null), 2000);
  }, []);

  // ═══════════════════════════════════════
  // 1. FETCH ORDERS FROM API (initial load)
  // ═══════════════════════════════════════
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${BASE_URL}/api/orders/my?page=${currentPage}&limit=7`, { 
      credentials: "include",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result && result.data) {
          setOrders(result.data);
          setTotalPages(result.totalPages || 1);
          setTotalItems(result.totalItems || 0);
        } else {
          setOrders(Array.isArray(result) ? result : []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch orders error:", err);
        setLoading(false);
      });
  }, [token, currentPage]);

  // ═══════════════════════════════════════
  // 2. SOCKET.IO — listen for order tracking updates
  //    Connection & user room handled by NotificationContext
  // ═══════════════════════════════════════
  useEffect(() => {
    if (!token || !user) return;

    const onOrderStatusUpdate = (updatedOrder) => {
      if (!updatedOrder?._id) return;

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
        )
      );

      triggerFlash(updatedOrder._id);
    };

    socket.on("orderStatusUpdate", onOrderStatusUpdate);

    return () => {
      socket.off("orderStatusUpdate", onOrderStatusUpdate);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      joinedRoomsRef.current.clear();
    };
  }, [token, user, triggerFlash]);

  // ═══════════════════════════════════════
  // 3. JOIN ORDER ROOM — only on expand, once per orderId
  // ═══════════════════════════════════════
  const joinOrderRoom = useCallback((orderId) => {
    if (!orderId || !socket.connected) return;
    if (joinedRoomsRef.current.has(orderId)) return; // Already joined

    socket.emit("joinOrderRoom", orderId);
    joinedRoomsRef.current.add(orderId);
  }, []);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));

    // Join room only when expanding (not collapsing), and only once
    if (!expandedOrders[orderId]) {
      joinOrderRoom(orderId);
    }
  };

  const executeCancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      const res = await fetch(`${BASE_URL}/api/orders/cancel/${orderId}`, { credentials: "include",
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: "Cancelled" } : o));
        triggerFlash(orderId);
        toast.success("Order cancelled successfully");
      } else {
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelOrder = (orderId) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-4'} max-w-sm w-full bg-white shadow-2xl rounded-3xl pointer-events-auto flex flex-col items-center text-center p-8 border border-gray-100 ring-1 ring-black ring-opacity-5`}>
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Cancel Order?</h3>
        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8 px-2">
            Are you absolutely sure you want to cancel this order? This action goes into effect immediately and cannot be reversed.
        </p>
        <div className="flex gap-3 w-full">
            <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 w-full border border-gray-200 py-3.5 text-xs font-black rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
                Keep Order
            </button>
            <button
                onClick={() => {
                  toast.dismiss(t.id);
                  executeCancelOrder(orderId);
                }}
                className="flex-1 w-full border border-transparent py-3.5 text-xs font-black rounded-2xl text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95"
            >
                Yes, Cancel
            </button>
        </div>
      </div>
    ), { duration: Infinity, id: `cancel-${orderId}` });
  };

  // ═══════════════════════════════════════
  // UI HELPERS
  // ═══════════════════════════════════════
  const getStatusConfig = (status) => {
    switch (status) {
      case "Delivered":
        return { color: "bg-green-100 text-green-700", icon: CheckCircle2, glow: "shadow-green-200" };
      case "Cancelled":
        return { color: "bg-red-100 text-red-700", icon: XCircle, glow: "shadow-red-200" };
      case "Shipped":
        return { color: "bg-blue-100 text-blue-700", icon: Truck, glow: "shadow-blue-200" };
      case "Processing":
      case "Packed":
        return { color: "bg-orange-100 text-orange-700", icon: Package, glow: "shadow-orange-200" };
      default:
        return { color: "bg-gray-100 text-gray-700", icon: Clock, glow: "shadow-gray-200" };
    }
  };

  const trackingSteps = ["Placed", "Packed", "Shipped", "Delivered"];

  const renderProgress = (order) => {
    const currentStatusIndex = trackingSteps.indexOf(order.orderStatus);
    const isCancelled = order.orderStatus === "Cancelled";
    const isFlashing = liveUpdateFlash === order._id;

    if (isCancelled) return null;

    return (
      <div className="mt-8 relative px-4 overflow-hidden">
        {/* Live status message */}
        {STATUS_MESSAGES[order.orderStatus] && (
          <div className={`mb-6 text-center transition-all duration-700 ${isFlashing ? "animate-bounce" : ""}`}>
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black ${
              isFlashing 
                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-lg shadow-green-200/50" 
                : "bg-gray-50 text-gray-500"
            } transition-all duration-500`}>
              <Zap className={`w-3.5 h-3.5 ${isFlashing ? "animate-pulse text-green-600" : ""}`} />
              {STATUS_MESSAGES[order.orderStatus]}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
            {trackingSteps.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const Icon = idx === 0 ? Clock : idx === 1 ? Package : idx === 2 ? Truck : CheckCircle2;
                
                return (
                    <div key={idx} className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-700 ${
                            isCompleted 
                              ? `bg-[#1F7A3B] text-white shadow-lg shadow-green-100 ${isCurrent && isFlashing ? "scale-125 ring-4 ring-green-200 animate-pulse" : "scale-100"}` 
                              : "bg-gray-100 text-gray-400"
                        }`}>
                            {isCompleted ? <Icon className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tighter mt-2 transition-all duration-500 ${
                            isCompleted ? "text-gray-900" : "text-gray-400"
                        } ${isCurrent && isFlashing ? "text-green-700 scale-110" : ""}`}>{step}</span>
                        {isCompleted && order.orderHistory?.find(h => h.status === step) && (
                            <span className="text-[8px] text-gray-400 font-bold">
                                {new Date(order.orderHistory?.find(h => h.status === step).date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
        {/* Progress Line */}
        <div className="absolute top-4 left-10 right-10 h-0.5 bg-gray-100 -z-0" style={{ top: STATUS_MESSAGES[order.orderStatus] ? 'calc(2rem + 56px)' : '1rem' }}>
            <div 
                className={`h-full bg-green-600 transition-all duration-1000 ease-out ${isFlashing ? "bg-gradient-to-r from-green-600 to-emerald-400" : ""}`}
                style={{ width: `${(Math.max(0, currentStatusIndex) / (trackingSteps.length - 1)) * 100}%` }}
            />
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfcfa]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Your Orders...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#fbfcfa] flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-[40px] shadow-xl border border-gray-100 max-w-sm w-full">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Login Required</h2>
            <p className="text-gray-400 font-medium mb-8">Please login to track and view your order history.</p>
            <Link to="/login" className="block w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                Go to Login
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfcfa] py-12 md:py-20 px-4">

      <div className="max-w-4xl mx-auto mb-10">
        <BackButton color="#1F7A3B" margin="0" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    My Orders
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-black -translate-y-1">{totalItems}</span>
                </h1>
                <p className="text-gray-400 font-medium mt-1">Track, manage and view your purchase history.</p>
            </div>
            <div className="flex items-center gap-4">
                {/* Live Connection Indicator */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
                  isConnected 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-red-50 text-red-600 border-red-200"
                }`}>
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <Wifi className="w-3 h-3" />
                      Live
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </>
                  )}
                </div>
                <Link to="/products" className="text-green-600 font-black text-sm flex items-center gap-2 hover:underline underline-offset-4">
                    Continue Shopping
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center shadow-xl border border-gray-100">
             <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center text-orange-400 mx-auto mb-8">
                <ShoppingBag className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-2">No Orders Yet</h3>
             <p className="text-gray-400 font-medium mb-10 max-w-xs mx-auto text-sm">Looks like you haven't started your organic journey with us yet!</p>
             <Link to="/products" className="inline-flex items-center gap-3 bg-[#1F7A3B] text-white px-10 py-5 rounded-full font-black text-lg shadow-lg shadow-green-100 hover:bg-[#185e2e] transition-all active:scale-95">
                Shop Now
                <ArrowRight className="w-5 h-5" />
             </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map(order => {
                const { color, icon: StatusIcon, glow } = getStatusConfig(order.orderStatus);
                const isExpanded = expandedOrders[order._id];
                const isFlashing = liveUpdateFlash === order._id;

                return (
                  <div 
                    key={order._id} 
                    className={`bg-white rounded-[32px] shadow-lg shadow-gray-200/50 border overflow-hidden transform transition-all duration-700 hover:shadow-xl group ${
                      isFlashing 
                        ? "border-green-300 shadow-xl shadow-green-200/30 ring-2 ring-green-200 scale-[1.01]" 
                        : "border-gray-50"
                    }`}
                  >
                    {/* HEADER */}
                    <div className="p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 cursor-pointer" onClick={() => toggleOrderExpand(order._id)}>
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-700 ${color} ${
                              isFlashing ? `shadow-lg ${glow} scale-110` : ""
                            }`}>
                                <StatusIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 pointer-events-none">
                                  ID: GB-{new Date(order.createdAt).getFullYear()}-{String(order._id).slice(-6).toUpperCase()}
                                </p>
                                <h3 className="text-lg font-black text-gray-900 group-hover:text-[#1F7A3B] transition-colors">₹{Number(order.totalAmount || 0).toFixed(2)}</h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-left md:text-right hidden sm:block">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 italic">Order Date</p>
                                <p className="text-sm font-black text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-700 ${color} ${
                              isFlashing ? `shadow-lg ${glow} scale-105` : ""
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full bg-current ${isFlashing ? "animate-ping" : "animate-pulse"}`} />
                                {order.orderStatus}
                            </div>
                            <div className="text-gray-300 transition-transform duration-300">
                                {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                            </div>
                        </div>
                    </div>

                    {/* EXPANDABLE SECTION */}
                    {isExpanded && (
                        <div className="border-t border-gray-100 bg-[#fbfcfa]/50 animate-in slide-in-from-top-4 duration-300">
                            <div className="p-8 md:p-10 space-y-10">
                                
                                {/* CANCELLED ALERT (Pro Feature) */}
                                {order.orderStatus === "Cancelled" && (
                                    <div className="mb-8 p-5 sm:p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start sm:items-center gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm sm:text-base font-black text-red-900">Order Cancelled</h4>
                                            <p className="text-red-700 text-[10px] sm:text-xs font-medium mt-1 leading-snug">
                                                This order was cancelled on {new Date(order.cancelledAt || order.orderHistory?.find(h => h.status === 'Cancelled')?.date || Date.now()).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. A refund (if applicable) will be processed shortly.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* PROGRESS TIMELINE */}
                                {renderProgress(order)}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                    {/* ITEMS LIST */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-3 flex items-center gap-2">
                                            <Package className="w-3 h-3" />
                                            Order Contents ({order.items?.length || 0})
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl group/item hover:border-green-200 transition-colors">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 p-1">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg group-hover/item:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1 py-1">
                                                        <p className="text-sm font-black text-gray-900 line-clamp-1">{item.name}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded">Qty: {item.qty}</span>
                                                            <span className="text-xs font-black text-green-700">₹{(item.price * item.qty).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* META & ADDRESS */}
                                    <div className="space-y-6">
                                        <div className="bg-white border border-gray-100 rounded-[28px] p-6 space-y-6 shadow-sm">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" />
                                                    Shipping To
                                                </h4>
                                                {order.customerDetails && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-gray-900">{order.customerDetails.firstName} {order.customerDetails.lastName}</p>
                                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{order.customerDetails.address}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{order.customerDetails.city}, {order.customerDetails.state} - {order.customerDetails.pincode}</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                        <CreditCard className="w-2.5 h-2.5" />
                                                        Payment
                                                    </div>
                                                    <p className="text-xs font-black text-gray-900">{order.paymentMethod || "COD"}</p>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        Pay Status
                                                    </div>
                                                    <p className="text-xs font-black text-gray-900">{order.paymentStatus || "Pending"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Link 
                                                to={`/invoice/${order._id}`} 
                                                className="flex-1 bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:border-green-200 hover:text-green-700 transition-all shadow-sm active:scale-95"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Invoice
                                            </Link>
                                            <button 
                                                className="flex-1 bg-[#1F7A3B] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-green-100 hover:bg-[#185e2e] active:scale-95 transition-all flex items-center justify-center gap-2"
                                                onClick={() => navigate("/contact")}
                                            >
                                                Help
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {/* CANCEL ORDER BUTTON */}
                                        {["Placed", "Packed"].includes(order.orderStatus) && (
                                            <div className="pt-2">
                                                <button
                                                  onClick={() => handleCancelOrder(order._id)}
                                                  disabled={cancellingId === order._id}
                                                  className="w-full bg-red-50 text-red-600 border border-red-100 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-100 hover:text-red-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {cancellingId === order._id ? (
                                                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                      <>
                                                        <XCircle className="w-5 h-5" />
                                                        Cancel Order
                                                      </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PAGINATION UI */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 py-10 mt-6 border-t border-gray-100">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 text-gray-500 hover:bg-white hover:text-[#1F7A3B] hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed group bg-white/50"
                >
                  <div className="rotate-90 group-hover:-translate-x-1 transition-transform">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${
                          currentPage === pageNum 
                            ? "bg-[#1F7A3B] text-white shadow-lg shadow-green-100 scale-110" 
                            : "bg-white text-gray-400 border border-gray-100 hover:border-green-200 hover:text-green-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-100 text-gray-500 hover:bg-white hover:text-[#1F7A3B] hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed group bg-white/50"
                >
                  <div className="-rotate-90 group-hover:translate-x-1 transition-transform">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FOOTER BADGE */}
      <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-full border border-gray-100 shadow-sm shadow-gray-200/50">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">100% Secure Transaction Control</span>
            </div>
      </div>
    </div>
  );
}
