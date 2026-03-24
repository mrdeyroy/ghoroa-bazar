import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  ChevronRight, 
  MapPin, 
  Calendar, 
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
  ChevronUp
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
        setLoading(false);
        return;
    }

    fetch(import.meta.env.VITE_API_URL + "/api/orders/my", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch orders error:", err);
        setLoading(false);
      });
  }, [token]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Delivered":
        return { color: "bg-green-100 text-green-700", icon: CheckCircle2 };
      case "Cancelled":
        return { color: "bg-red-100 text-red-700", icon: XCircle };
      case "Shipped":
        return { color: "bg-blue-100 text-blue-700", icon: Truck };
      case "Processing":
      case "Packed":
        return { color: "bg-orange-100 text-orange-700", icon: Package };
      default:
        return { color: "bg-gray-100 text-gray-700", icon: Clock };
    }
  };

  const trackingSteps = ["Placed", "Packed", "Shipped", "Delivered"];

  const renderProgress = (order) => {
    const currentStatusIndex = trackingSteps.indexOf(order.orderStatus);
    const isCancelled = order.orderStatus === "Cancelled";

    if (isCancelled) return null;

    return (
      <div className="mt-8 relative px-4 overflow-hidden">
        <div className="flex justify-between items-center mb-2">
            {trackingSteps.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const Icon = idx === 0 ? Clock : idx === 1 ? Package : idx === 2 ? Truck : CheckCircle2;
                
                return (
                    <div key={idx} className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 scale-100 ${
                            isCompleted ? "bg-[#1F7A3B] text-white shadow-lg shadow-green-100" : "bg-gray-100 text-gray-400"
                        }`}>
                            {isCompleted ? <Icon className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tighter mt-2 ${
                            isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}>{step}</span>
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
        <div className="absolute top-4 left-10 right-10 h-0.5 bg-gray-100 -z-0">
            <div 
                className="h-full bg-green-600 transition-all duration-1000" 
                style={{ width: `${(Math.max(0, currentStatusIndex) / (trackingSteps.length - 1)) * 100}%` }}
            />
        </div>
      </div>
    );
  };

  if (loading) {
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
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-black -translate-y-1">{orders.length}</span>
                </h1>
                <p className="text-gray-400 font-medium mt-1">Track, manage and view your purchase history.</p>
            </div>
            <Link to="/products" className="text-green-600 font-black text-sm flex items-center gap-2 hover:underline underline-offset-4">
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
            </Link>
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
          orders.map(order => {
            const { color, icon: StatusIcon } = getStatusConfig(order.orderStatus);
            const isExpanded = expandedOrders[order._id];

            return (
              <div 
                key={order._id} 
                className="bg-white rounded-[32px] shadow-lg shadow-gray-200/50 border border-gray-50 overflow-hidden transform transition-all hover:shadow-xl group"
              >
                {/* HEADER */}
                <div className="p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 cursor-pointer" onClick={() => toggleOrderExpand(order._id)}>
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${color}`}>
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
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${color}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
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
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            );
          })
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
