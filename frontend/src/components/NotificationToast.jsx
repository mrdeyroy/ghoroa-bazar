import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { X, Bell, Package, ArrowRight, Zap, Megaphone } from "lucide-react";

/**
 * Global floating toast notification component.
 * Mount once in App.jsx — it reads from NotificationContext automatically.
 * 
 * Features:
 * - Slide-in animation from top-right
 * - Click to navigate to relevant page
 * - Auto-dismiss after 4 seconds
 * - Manual dismiss via X button
 */
export default function NotificationToast() {
  const { toast, dismissToast } = useNotifications();
  const navigate = useNavigate();

  if (!toast) return null;

  const isNewOrder = toast.type === "new_order";
  const isOrderStatus = toast.type === "order_status";
  const isBroadcast = toast.type === "broadcast";

  const handleClick = () => {
    dismissToast();
    if (isNewOrder) {
      navigate("/admin/orders");
    } else if (isOrderStatus) {
      navigate("/my-orders");
    } else if (isBroadcast) {
      navigate("/");
    }
  };

  return (
    <div
      className="fixed top-5 right-5 z-[9999] max-w-sm w-full pointer-events-auto"
      style={{
        animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }}
    >
      <div
        onClick={handleClick}
        className={`flex items-start gap-4 p-5 rounded-2xl shadow-2xl border cursor-pointer backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
          isNewOrder
            ? "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200/60"
            : isBroadcast
            ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 border-blue-200/60"
            : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200/60"
        }`}
      >
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
          isNewOrder
            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
            : isBroadcast
            ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-blue-200"
            : "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
        }`}>
          {isNewOrder ? (
            <Bell className="w-5 h-5" />
          ) : isBroadcast ? (
            <Megaphone className="w-5 h-5" />
          ) : (
            <Package className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap className={`w-3 h-3 ${isNewOrder ? "text-amber-500" : isBroadcast ? "text-blue-500" : "text-green-500"} animate-pulse`} />
            <p className={`text-[10px] font-black uppercase tracking-widest ${
              isNewOrder ? "text-amber-600/70" : isBroadcast ? "text-blue-600/70" : "text-green-600/70"
            }`}>
              {isNewOrder ? "New Order Alert" : isBroadcast ? "📢 Announcement" : "Order Update"}
            </p>
          </div>
          <p className="text-sm font-bold text-gray-800 leading-snug">
            {toast.message}
          </p>
          {toast.totalAmount && (
            <p className="text-xs font-black text-gray-500 mt-1">
              ₹{Number(toast.totalAmount).toFixed(2)} • {toast.itemCount || 0} items
            </p>
          )}
          <div className={`flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest ${
            isNewOrder ? "text-amber-500" : isBroadcast ? "text-blue-500" : "text-green-500"
          }`}>
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-all flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CSS animation injected inline */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
