import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowUpRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function RecentOrders({ orders }) {
    const formatTimeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now - past;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        
        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    return (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900 tracking-tight">Recent Orders</h4>
                </div>
                <Link 
                    to="/admin/orders" 
                    className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline"
                >
                    View All
                </Link>
            </div>

            <div className="space-y-6">
                {orders && orders.length > 0 ? (
                    orders.map((order, idx) => (
                        <motion.div 
                            key={order._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between group"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-gray-900 group-hover:text-green-600 transition-colors">
                                    #{order._id.substring(order._id.length - 4).toUpperCase()}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    {order.userId?.name || order.customerDetails?.firstName || "Customer"}
                                </span>
                            </div>

                            <div className="flex flex-col items-center px-4">
                                <span className="text-sm font-black text-gray-900">₹{order.totalAmount}</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    {order.paymentMethod === "COD" ? "COD" : "ONLINE"}
                                </span>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    order.orderStatus === "Delivered" ? "bg-green-100 text-green-700" :
                                    order.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" :
                                    order.orderStatus === "Shipped" ? "bg-blue-100 text-blue-700" :
                                    "bg-amber-100 text-amber-700"
                                }`}>
                                    {order.orderStatus}
                                </span>
                                <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-gray-300">
                                    <Clock className="w-2.5 h-2.5" />
                                    {formatTimeAgo(order.createdAt)}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-xs font-bold text-gray-400 italic">No recent orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
