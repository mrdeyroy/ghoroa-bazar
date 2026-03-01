import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Link } from "react-router-dom";

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
        fetch("http://localhost:5000/api/admin/dashboard-stats")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load stats", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                    <h3>Loading Dashboard...</h3>
                </div>
            </AdminLayout>
        );
    }

    const statCards = [
        { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: "💰", color: "#4caf50", bg: "#e8f5e9" },
        { title: "Total Orders", value: stats.totalOrders, icon: "📦", color: "#2196f3", bg: "#e3f2fd" },
        { title: "Products", value: stats.totalProducts, icon: "🍯", color: "#ff9800", bg: "#fff3e0" },
        { title: "Active Users", value: stats.totalUsers, icon: "👥", color: "#9c27b0", bg: "#f3e5f5" }
    ];

    return (
        <AdminLayout>
            <h2 style={{ marginBottom: "24px", color: "#222" }}>Dashboard Overview</h2>

            {/* STATS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: "#fff",
                            padding: "24px",
                            borderRadius: "16px",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            transition: "transform 0.2sease, box-shadow 0.2s ease",
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = "translateY(-5px)";
                            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)";
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.04)";
                        }}
                    >
                        <div
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "14px",
                                background: card.bg,
                                color: card.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "28px"
                            }}
                        >
                            {card.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: "14px", color: "#777", fontWeight: "600", marginBottom: "4px" }}>
                                {card.title}
                            </div>
                            <div style={{ fontSize: "28px", color: "#222", fontWeight: "800" }}>
                                {card.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* RECENT ORDERS TABLE */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0, color: "#222" }}>Recent Orders</h3>
                    <Link
                        to="/admin/orders"
                        style={{
                            textDecoration: "none",
                            color: "#006837",
                            fontWeight: "600",
                            fontSize: "14px",
                            background: "#e8f5e9",
                            padding: "8px 16px",
                            borderRadius: "8px"
                        }}
                    >
                        View All →
                    </Link>
                </div>

                {stats.recentOrders.length === 0 ? (
                    <p style={{ color: "#777" }}>No recent orders found.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                                <th style={{ padding: "12px 16px", color: "#555", fontWeight: "600", fontSize: "14px", borderRadius: "10px 0 0 10px" }}>Order ID</th>
                                <th style={{ padding: "12px 16px", color: "#555", fontWeight: "600", fontSize: "14px" }}>Date</th>
                                <th style={{ padding: "12px 16px", color: "#555", fontWeight: "600", fontSize: "14px" }}>Amount</th>
                                <th style={{ padding: "12px 16px", color: "#555", fontWeight: "600", fontSize: "14px" }}>Payment</th>
                                <th style={{ padding: "12px 16px", color: "#555", fontWeight: "600", fontSize: "14px", borderRadius: "0 10px 10px 0" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map((order, idx) => (
                                <tr key={order._id} style={{ borderBottom: idx !== stats.recentOrders.length - 1 ? "1px solid #eee" : "none" }}>
                                    <td style={{ padding: "16px", fontSize: "14px", color: "#444" }}>#{order._id.substring(order._id.length - 8)}</td>
                                    <td style={{ padding: "16px", fontSize: "14px", color: "#777" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: "600", color: "#222" }}>₹{Number(order.totalAmount || 0).toFixed(2)}</td>
                                    <td style={{ padding: "16px" }}>
                                        <span
                                            style={{
                                                background: order.paymentStatus === "Paid" ? "#e8f5e9" : "#fff3e0",
                                                color: order.paymentStatus === "Paid" ? "#4caf50" : "#ff9800",
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                fontSize: "12px",
                                                fontWeight: "600"
                                            }}
                                        >
                                            {order.paymentStatus || "Pending"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px" }}>
                                        <span
                                            style={{
                                                background: order.orderStatus === "Delivered" ? "#e8f5e9" : order.orderStatus === "Cancelled" ? "#ffebee" : "#e3f2fd",
                                                color: order.orderStatus === "Delivered" ? "#4caf50" : order.orderStatus === "Cancelled" ? "#f44336" : "#2196f3",
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                fontSize: "12px",
                                                fontWeight: "600"
                                            }}
                                        >
                                            {order.orderStatus || "Placed"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}
