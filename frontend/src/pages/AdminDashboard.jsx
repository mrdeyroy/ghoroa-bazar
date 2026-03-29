import { useEffect, useState, useCallback } from "react";
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
    ChevronRight,
    Download,
    AlertTriangle,
    RefreshCcw,
    DollarSign,
    Box,
    ShoppingCart,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

// Import custom components
import MetricCard from "../components/admin/MetricCard";
import SalesLineChart from "../components/admin/SalesLineChart";
import OrderStatusPieChart from "../components/admin/OrderStatusPieChart";
import TopProductsBarChart from "../components/admin/TopProductsBarChart";
import RecentOrders from "../components/admin/RecentOrders";

export default function AdminDashboard() {
    const [data, setData] = useState({
        metrics: {
            todayRevenue: 0,
            yesterdayRevenue: 0,
            totalRevenue: 0,
            totalOrders: 0,
            totalUsers: 0,
            totalProducts: 0,
            revenueGrowth: 0,
            monthlyRevenue: 0,
            monthlyOrders: 0,
            newUsersThisMonth: 0
        },
        charts: {
            monthlySales: [],
            orderStatusCounts: []
        },
        topProducts: [],
        lowStockProducts: [],
        recentOrders: []
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(
                import.meta.env.VITE_API_URL + "/api/admin/analytics-stats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) throw new Error(`Request failed: ${res.status}`);

            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error("Failed to load analytics", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();

        // Real-time updates via Socket.io
        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ["websocket"],
            withCredentials: true
        });

        socket.on("connect", () => {
            console.log("Connected to admin real-time stream");
            socket.emit("joinAdminRoom");
        });

        // Listen for events that should trigger a refresh
        const handleUpdate = () => {
            console.log("Real-time update received, refreshing dashboard...");
            fetchAnalytics(true);
        };

        socket.on("admin:notification", handleUpdate);
        socket.on("stockUpdated", handleUpdate);
        socket.on("orderStatusUpdate", handleUpdate);

        return () => {
            socket.disconnect();
        };
    }, [fetchAnalytics]);

    const exportToCSV = () => {
        const rows = [
            ["Metric", "Value"],
            ["Total Revenue", data.metrics.totalRevenue],
            ["Today's Revenue", data.metrics.todayRevenue],
            ["Total Orders", data.metrics.totalOrders],
            ["Total Products", data.metrics.totalProducts],
            ["Total Users", data.metrics.totalUsers],
            ["Monthly Revenue", data.metrics.monthlyRevenue],
            ["Revenue Growth", data.metrics.revenueGrowth + "%"]
        ];

        let csvContent = "data:text/csv;charset=utf-8," 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `analytics_report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="space-y-8 animate-pulse">
                    <div className="h-10 w-64 bg-gray-200 rounded-xl mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-100 rounded-[32px]" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-[400px] bg-gray-100 rounded-[32px]" />
                        <div className="h-[400px] bg-gray-100 rounded-[32px]" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const calculateDailyTrend = () => {
        const today = data.metrics.todayRevenue;
        const yesterday = data.metrics.yesterdayRevenue;
        if (yesterday === 0) return today > 0 ? 100 : 0;
        return (((today - yesterday) / yesterday) * 100).toFixed(1);
    };

    const metricCards = [
        {
            title: "Today's Revenue",
            value: `₹${Number(data.metrics.todayRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            trend: calculateDailyTrend(),
            trendUp: data.metrics.todayRevenue >= data.metrics.yesterdayRevenue,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Total Revenue",
            value: `₹${Number(data.metrics.totalRevenue || 0).toLocaleString()}`,
            icon: CreditCard,
            trend: data.metrics.revenueGrowth,
            trendUp: data.metrics.revenueGrowth >= 0,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Total Orders",
            value: Number(data.metrics.totalOrders || 0).toLocaleString(),
            icon: ShoppingCart,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: "Inventory Items",
            value: Number(data.metrics.totalProducts || 0).toLocaleString(),
            icon: Box,
            color: "text-orange-600",
            bg: "bg-orange-50"
        }
    ];

    return (
        <AdminLayout>
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Executive Dashboard</h1>
                            {refreshing && <RefreshCcw className="w-5 h-5 text-green-600 animate-spin" />}
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-[11px] pl-1">Operational Overview & Real-time Analytics</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-black bg-white shadow-sm border border-gray-100 px-4 py-2.5 rounded-2xl text-gray-500 italic">
                            <Clock className="w-3.5 h-3.5 text-green-600" />
                            Live: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <button 
                            onClick={() => fetchAnalytics(true)}
                            className="p-2.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:bg-gray-50 transition-colors shadow-sm active:scale-90"
                            title="Refresh Data"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>

                        <button 
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#064734] text-[#E0FFC2] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#0a5c44] transition-all shadow-lg shadow-green-900/20 active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            Export Data
                        </button>
                    </div>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {metricCards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <MetricCard {...card} />
                    </motion.div>
                ))}
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <SalesLineChart data={data.charts.monthlySales} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <OrderStatusPieChart data={data.charts.orderStatusCounts} />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* LEFT COLUMN: TOP PRODUCTS BAR CHART & RECENT ORDERS (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <TopProductsBarChart data={data.topProducts} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <RecentOrders orders={data.recentOrders} />
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: SUMMARY PANEL + INVENTORY ALERTS (1/3) */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gray-900 rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[100px] opacity-20" />
                        <h4 className="text-xl font-black mb-4 relative z-10 flex items-center gap-2">
                            Monthly Summary
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest italic ml-auto">
                                Active
                            </span>
                        </h4>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Monthly Revenue</p>
                                    <h5 className="text-2xl font-black tracking-tighter text-white">₹{Number(data.metrics.monthlyRevenue).toLocaleString()}</h5>
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${data.metrics.revenueGrowth >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                    {data.metrics.revenueGrowth >= 0 ? "+" : ""}{data.metrics.revenueGrowth}%
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Orders</p>
                                    <p className="text-xl font-black text-white">{data.metrics.monthlyOrders}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">New Customers</p>
                                    <p className="text-xl font-black text-white">{data.metrics.newUsersThisMonth}</p>
                                </div>
                            </div>

                            {data.topProducts[0] && (
                                <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                        <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Top Selling Product</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={data.topProducts[0].image} 
                                            alt={data.topProducts[0].name} 
                                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-green-500/30"
                                        />
                                        <div>
                                            <p className="text-sm font-black text-white line-clamp-1">{data.topProducts[0].name}</p>
                                            <p className="text-[10px] font-bold text-gray-500">{data.topProducts[0].purchaseCount} units sold</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* LOW STOCK ALERTS */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Inventory Alerts
                            </h4>
                            <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest">
                                {data.lowStockProducts?.length} Low
                            </span>
                        </div>

                        <div className="space-y-4">
                            {data.lowStockProducts && data.lowStockProducts.length > 0 ? (
                                data.lowStockProducts.map((prod, idx) => (
                                    <div key={prod._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                        <img src={prod.image} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-gray-900 line-clamp-1">{prod.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${prod.stock < 5 ? 'bg-red-500' : 'bg-amber-500'}`} 
                                                        style={{ width: `${(prod.stock / 10) * 100}%` }} 
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-900">{prod.stock} left</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center">
                                    <p className="text-xs font-bold text-gray-400 italic">Inventory levels within safe range</p>
                                </div>
                            )}
                            <Link 
                                to="/admin/products"
                                className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-gray-50 hover:bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors"
                            >
                                Restock Assets <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* TABLE SECTION (TOP PRODUCTS) */}
            <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-gray-100 overflow-hidden mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Top Performance Assets</h3>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Direct sorted by market penetration</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/admin/products"
                            className="text-[10px] font-black uppercase tracking-widest text-[#1F7A3B] bg-green-50 px-6 py-3 rounded-full hover:bg-green-100 transition-colors flex items-center gap-2"
                        >
                            Catalog Manager <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full border-separate border-spacing-y-4 px-8 sm:px-0">
                        <thead>
                            <tr className="text-left">
                                <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Line</th>
                                <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category</th>
                                <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Volume Sold</th>
                                <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Market Rating</th>
                                <th className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topProducts.map((prod) => (
                                <tr key={prod._id} className="group hover:bg-gray-50 transition-colors rounded-3xl">
                                    <td className="px-6 py-5 bg-white border-y border-l border-gray-50 rounded-l-[32px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden p-1 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                                <img src={prod.image} alt="" className="w-full h-full object-cover rounded-xl" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-gray-900 line-clamp-1">{prod.name}</p>
                                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">Asset #{prod._id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-white border-y border-gray-50">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-50 text-gray-500 rounded-lg">
                                            {prod.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 bg-white border-y border-gray-50 text-center">
                                        <span className="text-sm font-black text-gray-900">{prod.purchaseCount} <span className="text-[10px] text-gray-400 uppercase ml-1">Units</span></span>
                                    </td>
                                    <td className="px-6 py-5 bg-white border-y border-gray-50 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                                            <span className="text-sm font-black text-gray-900">{prod.rating || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 bg-white border-y border-r border-gray-50 rounded-r-[32px] text-right">
                                        <span className="text-sm font-black text-[#1F7A3B]">₹{Number(prod.price).toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
