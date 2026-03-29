import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({ title, value, icon: Icon, trend, trendUp, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${bg} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trend}%
                        </div>
                    )}
                </div>
                
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{value}</h3>
            </div>
        </div>
    );
}
