import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronDown, 
  MoreHorizontal,
  Mail,
  User,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  FileText,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  X,
  CreditCard as PaymentIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import socket from "../utils/socket";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setOrders([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ⚡ Auto-refresh when a new order notification or cancellation comes in
  useEffect(() => {
    const onNewOrder = () => {
      fetchOrders(); // Re-fetch the full list
    };
    
    const onOrderCancelled = () => {
      fetchOrders();
    }

    socket.on("newOrderNotification", onNewOrder);
    socket.on("orderCancelled", onOrderCancelled);

    return () => {
      socket.off("newOrderNotification", onNewOrder);
      socket.off("orderCancelled", onOrderCancelled);
    };
  }, [fetchOrders]);

  const updateStatus = async (id, newStatus) => {
    const updateData = { orderStatus: newStatus };
    if (newStatus === "Delivered") updateData.paymentStatus = "Paid";

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      fetchOrders();
      // Update modal if it's open for this order
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus, paymentStatus: updateData.paymentStatus || prev.paymentStatus }));
      }
    } catch (err) {
      console.error("Failed to update order", err);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.customerDetails?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "Shipped": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Processing":
      case "Packed": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const openOverlook = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <AdminLayout>
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">System Order Registry</h1>
        <p className="text-gray-400 font-medium mt-1 uppercase tracking-widest text-[8px] sm:text-[10px] pl-1">Global management of all customer transactions</p>
      </div>

      {/* FILTERS AREA */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 sm:mb-8">
        <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search by ID, Name, or Email..."
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-sm focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="w-fit flex items-center gap-3 bg-white px-6 py-3 sm:py-4 border border-gray-100 rounded-2xl sm:rounded-3xl shadow-sm">
            <Filter className="text-gray-400 w-4 h-4" />
            <select 
                className="bg-transparent font-black uppercase text-[10px] tracking-widest outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="All">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
      </div>

      {/* ORDERS DISPLAY - TABLE FOR DESKTOP, CARDS FOR MOBILE */}
      <div className="bg-white rounded-[28px] sm:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mb-12">
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Order Information</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Payment</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Revenue</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Order Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Registry loading...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <p className="text-gray-400 font-medium italic">No matching orders found.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const formattedUIId = `GB-${new Date(order.createdAt).getFullYear()}-${order._id.slice(-6).toUpperCase()}`;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group text-sm">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 font-mono tracking-tighter">{formattedUIId}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-3 h-3 text-gray-300" />
                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-black text-gray-700 line-clamp-1">
                                <User className="w-3 h-3 text-gray-400" />
                                {order.customerDetails?.firstName} {order.customerDetails?.lastName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 line-clamp-1">
                                <Mail className="w-3 h-3 text-gray-300" />
                                {order.customerDetails?.email || order.userId?.email || "N/A"}
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                            <div className="flex items-center gap-1.5 mb-1.5 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-black uppercase text-gray-500 tracking-tighter">
                                <PaymentIcon className="w-2.5 h-2.5" />
                                {order.paymentMethod || "COD"}
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${order.paymentStatus === 'Paid' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                                {order.paymentStatus || 'Pending'}
                            </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div>
                            <p className="text-sm font-black text-gray-900 font-mono">₹{Number(order.totalAmount || 0).toFixed(2)}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{order.items?.length || 0} Items</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="relative w-fit">
                            {order.orderStatus === "Cancelled" ? (
                                <div className="font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full border bg-red-100 text-red-700 border-red-200 opacity-80 cursor-not-allowed">
                                    ❌ Order Cancelled
                                </div>
                            ) : (
                                <>
                                    <select 
                                        value={order.orderStatus || "Placed"}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                        className={`appearance-none font-black text-[10px] uppercase tracking-widest pl-3 pr-8 py-2 rounded-full border transition-all cursor-pointer outline-none ${getStatusStyle(order.orderStatus)}`}
                                    >
                                        <option value="Placed">Placed</option>
                                        <option value="Packed">Packed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancel Order</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                </>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Link 
                                to={`/invoice/${order._id}`} 
                                target="_blank"
                                className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-green-100 hover:text-green-700 transition-all shadow-sm"
                            >
                                <FileText className="w-4 h-4" />
                            </Link>
                            <button 
                                className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#1F7A3B] hover:text-white transition-all shadow-sm"
                                onClick={() => openOverlook(order)}
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="lg:hidden p-4 space-y-4 bg-gray-50/50">
          {loading ? (
             <div className="py-10 text-center">
                <div className="w-8 h-8 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Loading Registry...</p>
             </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center py-10 text-gray-400 font-medium italic">No matching orders found.</p>
          ) : (
            filteredOrders.map((order) => {
              const formattedUIId = `GB-${new Date(order.createdAt).getFullYear()}-${order._id.slice(-6).toUpperCase()}`;
              return (
                <div key={order._id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-900 font-mono tracking-tighter">{formattedUIId}</h4>
                        <p className="text-[10px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900 font-mono">₹{Number(order.totalAmount || 0).toFixed(2)}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{order.items?.length || 0} Items</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-y border-gray-50 text-xs">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                       <p className="font-black text-gray-700 truncate max-w-[120px]">
                         {order.customerDetails?.firstName} {order.customerDetails?.lastName}
                       </p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment</p>
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${order.paymentStatus === 'Paid' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                          {order.paymentStatus || 'Pending'}
                       </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="relative flex-1">
                       {order.orderStatus === "Cancelled" ? (
                           <div className="w-full text-center font-black text-[10px] uppercase tracking-widest px-3 py-3 rounded-2xl border bg-red-100 text-red-700 border-red-200 opacity-80 cursor-not-allowed">
                               ❌ Order Cancelled
                           </div>
                       ) : (
                           <>
                               <select 
                                  value={order.orderStatus || "Placed"}
                                  onChange={(e) => updateStatus(order._id, e.target.value)}
                                  className={`w-full appearance-none font-black text-[10px] uppercase tracking-widest pl-3 pr-8 py-3 rounded-2xl border transition-all cursor-pointer outline-none ${getStatusStyle(order.orderStatus)}`}
                               >
                                  <option value="Placed">Placed</option>
                                  <option value="Packed">Packed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancel Order</option>
                               </select>
                               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                           </>
                       )}
                    </div>
                    <div className="flex gap-2">
                       <Link 
                          to={`/invoice/${order._id}`} 
                          target="_blank"
                          className="w-11 h-11 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center active:bg-green-100 active:text-green-700 transition-all border border-gray-100"
                       >
                          <FileText className="w-5 h-5" />
                       </Link>
                       <button 
                          onClick={() => openOverlook(order)}
                          className="w-11 h-11 rounded-2xl bg-[#0F1E11] text-white flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-green-900/10"
                       >
                          <Eye className="w-5 h-5 text-[#66FF99]" />
                       </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* OVERLOOK MODAL - FULLY RESPONSIVE */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[100vh] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                  Overlook
                </h2>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">
                  GB-{new Date(selectedOrder.createdAt).getFullYear()}-{selectedOrder._id.slice(-6).toUpperCase()}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors shadow-sm active:scale-95"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Side Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Snapshot */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                       <User className="w-3.5 h-3.5" />
                       Customer Info
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Full Name</p>
                           <p className="text-sm font-black text-gray-900">{selectedOrder.customerDetails?.firstName} {selectedOrder.customerDetails?.lastName}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Email</p>
                           <p className="text-sm font-black text-gray-900 truncate">{selectedOrder.customerDetails?.email || selectedOrder.userId?.email || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Phone</p>
                           <p className="text-sm font-black text-gray-900">{selectedOrder.customerDetails?.phone || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">System ID</p>
                           <p className="text-[10px] font-mono text-gray-400 break-all">{selectedOrder.userId?._id || "Guest"}</p>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-2">Delivery Address</p>
                        <div className="flex items-start gap-3 bg-gray-50/50 p-4 rounded-2xl">
                            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs font-bold text-gray-700 leading-relaxed">
                                {selectedOrder.customerDetails?.address}, {selectedOrder.customerDetails?.city}, {selectedOrder.customerDetails?.state} - {selectedOrder.customerDetails?.pincode}
                            </p>
                        </div>
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                       <Package className="w-3.5 h-3.5" />
                       Items Registry
                    </h3>
                    <div className="space-y-3">
                        {selectedOrder.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/30 border border-gray-50 group hover:border-green-100 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover p-1" />
                                    </div>
                                    <div className="max-w-[120px] sm:max-w-none">
                                        <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{item.weight || 'Std'} × {item.qty}</p>
                                    </div>
                                </div>
                                <p className="text-xs font-black text-gray-900">₹{(item.price * item.qty).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Right Side Logistics */}
                <div className="space-y-6 sm:space-y-8">
                   <div className="bg-[#0F1E11] rounded-[28px] sm:rounded-[32px] p-6 text-white shadow-xl shadow-green-900/10 border border-white/5">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Financial Snapshot</h3>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-2">
                                <PaymentIcon className="w-3.5 h-3.5 text-[#66FF99]" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">{selectedOrder.paymentMethod || 'COD'}</span>
                             </div>
                             <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${selectedOrder.paymentStatus === 'Paid' ? 'bg-[#66FF99] text-[#0F1E11]' : 'bg-orange-500 text-white animate-pulse'}`}>
                                {selectedOrder.paymentStatus || 'Pending'}
                             </span>
                          </div>
                          <div className="flex justify-between items-end pt-2">
                              <p className="text-[10px] font-black uppercase text-white/40">Grand Total</p>
                              <p className="text-3xl font-black text-[#66FF99]">₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                          </div>
                      </div>
                   </div>

                   <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Logistic Trace
                      </h3>
                      <div className="space-y-6 relative ml-2">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-100 translate-x-[-1px]" />
                        
                        {selectedOrder.orderHistory?.length > 0 ? (
                          [...selectedOrder.orderHistory]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((history, idx) => (
                              <div key={idx} className={`relative pl-6 ${idx !== 0 ? 'opacity-40' : ''}`}>
                                <div className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full ${
                                  history.status === 'Cancelled' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.4)]' : 
                                  'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                                }`} />
                                <p className={`text-[10px] font-black uppercase tracking-widest ${
                                  history.status === 'Cancelled' ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                  {history.status}
                                </p>
                                <p className="text-[9px] text-gray-400 font-bold mt-1">
                                  {new Date(history.date).toLocaleString('en-IN', { 
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            ))
                        ) : (
                          <div className="relative pl-6">
                            <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Registry Initiated</p>
                            <p className="text-[9px] text-gray-400 font-bold mt-1">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                  <Link 
                    to={`/invoice/${selectedOrder._id}`} 
                    target="_blank"
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl text-xs font-black shadow-sm hover:border-green-200 hover:text-green-700 transition-all active:scale-95 w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4" />
                    Digital Invoice
                  </Link>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                       onClick={closeModal}
                       className="flex-1 sm:flex-none px-6 py-4 rounded-2xl text-xs font-black text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button 
                       onClick={() => alert(`Operational Sync triggered for: ${selectedOrder._id}`)}
                       className="flex-[2] sm:flex-none bg-[#0F1E11] text-white px-8 py-4 rounded-2xl text-xs font-black shadow-lg shadow-green-900/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Process Log
                      <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
