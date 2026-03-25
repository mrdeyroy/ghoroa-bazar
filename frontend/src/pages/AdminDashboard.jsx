import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Link } from "react-router-dom";
import {
    ShoppingBag,
    Users,
    Package,
    CreditCard,
    ArrowUpRight,
    TrendingUp,
    Clock,
    ArrowRight,
    ChevronRight,
    TrendingDown
} from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentOrders: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("adminToken");

                const res = await fetch(
                    import.meta.env.VITE_API_URL + "/api/admin/dashboard-stats",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // handle unauthorized
                if (!res.ok) {
                    throw new Error(`Request failed: ${res.status}`);
                }

                const data = await res.json();

                // safe fallback to prevent crashes
                setStats({
                    totalOrders: data.totalOrders || 0,
                    totalProducts: data.totalProducts || 0,
                    totalUsers: data.totalUsers || 0,
                    totalRevenue: data.totalRevenue || 0,
                    recentOrders: data.recentOrders || []
                });

            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Analytics are coming together...</p>
                </div>
            </AdminLayout>
        );
    }

    const statCards = [
        {
            title: "Total Revenue",
            value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
            icon: CreditCard,
            trend: "+12.5%",
            trendUp: true,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        {
            title: "Total Orders",
            value: (stats.totalOrders || 0).toLocaleString(),
            icon: ShoppingBag,
            trend: "+5.4%",
            trendUp: true,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            title: "Inventory Items",
            value: (stats.totalProducts || 0).toLocaleString(),
            icon: Package,
            trend: "0.2%",
            trendUp: false,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100"
        },
        {
            title: "Registered Users",
            value: (stats.totalUsers || 0).toLocaleString(),
            icon: Users,
            trend: "+1.2%",
            trendUp: true,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100"
        }
    ];

    return (
        <AdminLayout>
            <div className="mb-8 sm:mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Executive Dashboard</h1>
                        <p className="text-gray-400 font-medium mt-1 uppercase tracking-widest text-[8px] sm:text-[10px] pl-1">Operational Overview & System Metrics</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-2xl text-gray-400 italic w-fit">
                        <Clock className="w-3 h-3 text-green-600" />
                        Live: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* STATS GRID - RESPONSIVE 1->2->4 COLUMNS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.bg} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${card.bg} ${card.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg ${card.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                    {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {card.trend}
                                </div>
                            </div>

                            <p className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{card.title}</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* RECENT ORDERS TABLE - RESPONSIVE SCROLL */}
                <div className="lg:col-span-2 bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 text-center sm:text-left">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Direct link to last 5 transactions</p>
                        </div>
                        <Link
                            to="/admin/orders"
                            className="w-fit mx-auto sm:mx-0 text-[10px] font-black uppercase tracking-widest text-[#1F7A3B] bg-green-50 px-5 py-2.5 rounded-full hover:bg-green-100 transition-colors flex items-center gap-2"
                        >
                            Log History <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {!stats.recentOrders || stats.recentOrders.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-gray-50 rounded-[32px]">
                            <p className="text-gray-400 font-medium">System reports zero recent transactions.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6 sm:mx-0">
                            <div className="min-w-[600px] px-6 sm:px-0">
                                <table className="w-full border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order Ref</th>
                                            <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date/Time</th>
                                            <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Revenue</th>
                                            <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentOrders.map((order) => (
                                            <tr key={order._id} className="group hover:bg-gray-50 transition-colors rounded-3xl">
                                                <td className="px-6 py-5 bg-white border-y border-l border-gray-50 rounded-l-3xl first:border-l-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-[10px] font-black">
                                                            #{order._id.substring(order._id.length - 4).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-black text-gray-900 font-mono">GB-{new Date(order.createdAt).getFullYear()}-{order._id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 bg-white border-y border-gray-50">
                                                    <p className="text-xs font-black text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </td>
                                                <td className="px-6 py-5 bg-white border-y border-gray-50 text-right">
                                                    <span className="text-sm font-black text-gray-900">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                                                </td>
                                                <td className="px-6 py-5 bg-white border-y border-r border-gray-50 rounded-r-3xl first:border-r-0 text-center">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === "Delivered" ? "bg-green-100 text-green-700" :
                                                            order.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" :
                                                                "bg-blue-100 text-blue-700"
                                                            }`}
                                                    >
                                                        {order.orderStatus || "Placed"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* SIDE ACTIONS/SUMMARY */}
                <div className="space-y-6 sm:space-y-8">
                    <div className="bg-gray-900 rounded-[32px] sm:rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[100px] opacity-30" />
                        <h4 className="text-xl font-black mb-2 relative z-10">Admin Access</h4>
                        <p className="text-gray-400 text-sm mb-10 relative z-10 line-clamp-2 sm:line-clamp-none">Your operational control panel is active. Perform batch updates directly from order logs.</p>

                        <div className="space-y-4 relative z-10">
                            <Link to="/admin/products" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                                <span className="text-sm font-bold">Manage Products</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/admin/orders" className="flex items-center justify-between p-4 bg-green-600 rounded-2xl hover:bg-green-700 transition-all group shadow-lg shadow-green-900/40">
                                <span className="text-sm font-bold">Process Orders</span>
                                <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[#1F7A3B] rounded-[32px] sm:rounded-[40px] p-8 text-white shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Revenue Peak</p>
                                <h5 className="text-xl font-black">Target Track</h5>
                            </div>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-white w-[75%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        </div>
                        <p className="text-xs font-medium text-white/80">Monthly revenue goal is 75% complete. Average order value is stable.</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
