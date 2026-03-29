import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function TopProductsBarChart({ data }) {
    const chartData = data?.map((item, index) => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
        sold: item.purchaseCount,
        color: COLORS[index % COLORS.length]
    })) || [];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-[32px] shadow-sm border border-gray-100 min-h-[420px] sm:h-[400px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Selling Products</h3>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Based on purchase count</p>
                </div>
            </div>

            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#6b7280' }}
                            width={100}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                            labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', color: '#9ca3af' }}
                        />
                        <Bar 
                            dataKey="sold" 
                            radius={[0, 8, 8, 0]} 
                            barSize={24}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
