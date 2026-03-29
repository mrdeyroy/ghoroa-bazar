const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to get start of day, month, etc.
const getStartOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getStartOfMonth = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
};

exports.getDashboardStats = async (req, res) => {
    try {
        const today = getStartOfDay();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const startOfMonth = getStartOfMonth();
        const lastMonth = new Date(startOfMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        // 1. Basic Counts
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        // 2. Revenue (Total All Time)
        const totalRevenueResult = await Order.aggregate([
            { $match: { orderStatus: { $ne: "Cancelled" } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // 3. Today's Revenue & Yesterday's Revenue (for % change)
        const todayRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: today },
                    orderStatus: { $ne: "Cancelled" }
                } 
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const todayRevenue = todayRevenueResult[0]?.total || 0;

        const yesterdayRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: yesterday, $lt: today },
                    orderStatus: { $ne: "Cancelled" }
                } 
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const yesterdayRevenue = yesterdayRevenueResult[0]?.total || 0;

        // 4. Monthly Sales (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    orderStatus: { $ne: "Cancelled" }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 5. Order Status Distribution
        const orderStatusCounts = await Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);

        // 6. Top Selling Products (Top 5)
        const topProducts = await Product.find()
            .sort({ purchaseCount: -1 })
            .limit(5)
            .select("name image category purchaseCount rating price");

        // 7. Summary Panel Data
        const monthlyRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: startOfMonth },
                    orderStatus: { $ne: "Cancelled" }
                } 
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);
        const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
        const monthlyOrders = monthlyRevenueResult[0]?.count || 0;

        const lastMonthlyRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: lastMonth, $lt: startOfMonth },
                    orderStatus: { $ne: "Cancelled" }
                } 
            },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const lastMonthlyRevenue = lastMonthlyRevenueResult[0]?.total || 0;
        
        const revenueGrowth = lastMonthlyRevenue === 0 ? 100 : (((monthlyRevenue - lastMonthlyRevenue) / lastMonthlyRevenue) * 100).toFixed(2);

        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

        const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
            .limit(5)
            .select("name stock image");

        // 8. Recent Orders (already exists but useful to include here)
        const recentOrders = await Order.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            metrics: {
                todayRevenue,
                yesterdayRevenue,
                totalRevenue,
                totalOrders,
                totalUsers,
                totalProducts,
                revenueGrowth,
                monthlyRevenue,
                monthlyOrders,
                newUsersThisMonth
            },
            charts: {
                monthlySales,
                orderStatusCounts
            },
            topProducts,
            lowStockProducts,
            recentOrders
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ error: "Failed to fetch complex dashboard stats" });
    }
};
