import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
    '#3b82f6', // blue
    '#f59e0b', // orange
    '#ef4444', // red
    '#10b981', // green
    '#8b5cf6', // purple
    '#6b7280'  // gray
];

const statusMap = {
    'pending_verification': 'Pending Verification',
    'Placed': 'Placed',
    'Packed': 'Packed',
    'Shipped': 'Shipped',
    'Delivered': 'Delivered',
    'Cancelled': 'Cancelled'
};

export default function OrderStatusPieChart({ data }) {
    const chartData = data?.map(item => ({
        name: statusMap[item._id] || item._id,
        value: item.count
    })) || [];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-[32px] shadow-sm border border-gray-100 h-[430px] sm:h-[400px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Order Distribution</h3>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Status Wise Breakdown</p>
                </div>
            </div>

            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280' }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
