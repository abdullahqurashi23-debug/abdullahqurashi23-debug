'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useSocketEvent } from '@/lib/socket';
import {
    Calendar,
    ArrowLeft,
    TrendingUp,
    Droplet,
    Search
} from 'lucide-react';

interface Sale {
    id: string;
    fuelType: string;
    liters: number;
    totalAmount: number;
    paymentMethod: string;
    vehicleNumber?: string;
    saleDate: string;
    timestamp?: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PETROL' | 'DIESEL'>('ALL');

    const loadSales = useCallback(async () => {
        try {
            const data = await api.getMyTodaySales();
            setSales(data?.sales || []);
        } catch (error) {
            console.error('Failed to load sales:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    // Real-time: Refresh when new sale is recorded
    useSocketEvent('sale:new', () => {
        loadSales();
    });


    const filteredSales = filter === 'ALL'
        ? sales
        : sales.filter(s => s.fuelType === filter);

    const totalAmount = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalLiters = filteredSales.reduce((sum, s) => sum + Number(s.liters || 0), 0);

    return (
        <div className="relative min-h-screen pb-32 pt-4 px-4 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales History</h1>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Today's Overview
                        </p>
                    </div>
                </div>

                {/* Summary Card - Dark Glass Style */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 shadow-2xl shadow-slate-900/20 mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                        <TrendingUp className="w-24 h-24" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                            <p className="text-lg font-bold tracking-tight">Rs {totalAmount.toLocaleString()}</p>
                            <p className="text-[10px] opacity-70 uppercase tracking-widest font-semibold mt-1">Revenue</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                            <p className="text-lg font-bold tracking-tight">{Number(totalLiters).toFixed(1)} L</p>
                            <p className="text-[10px] opacity-70 uppercase tracking-widest font-semibold mt-1">Volume</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                            <p className="text-lg font-bold tracking-tight">{filteredSales.length}</p>
                            <p className="text-[10px] opacity-70 uppercase tracking-widest font-semibold mt-1">Sales</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6 shadow-inner">
                    {(['ALL', 'PETROL', 'DIESEL'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${filter === f
                                ? 'bg-white text-slate-900 shadow-sm scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                        >
                            {f === 'ALL' ? 'All Sales' : f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Droplet className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-900">No sales recorded yet</p>
                        <p className="text-xs text-slate-500 mt-1">Start a new sale to see it here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSales.map((sale) => {
                            const isPetrol = sale.fuelType === 'PETROL';
                            return (
                                <div
                                    key={sale.id}
                                    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between group hover:shadow-md hover:scale-[1.01] hover:bg-white transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${isPetrol
                                                ? 'bg-orange-50 border-orange-100 text-orange-500 group-hover:bg-orange-100'
                                                : 'bg-teal-50 border-teal-100 text-teal-600 group-hover:bg-teal-100'
                                                }`}
                                        >
                                            <Droplet className="w-6 h-6" fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">Rs {(sale.totalAmount || 0).toLocaleString()}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <span className={isPetrol ? 'text-orange-600 font-bold' : 'text-teal-600 font-bold'}>{sale.fuelType}</span>
                                                <span className="text-slate-300">•</span>
                                                <span>{Number(sale.liters).toFixed(2)} L</span>
                                                <span className="text-slate-300">•</span>
                                                <span>{sale.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-slate-400 tabular-nums block bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover:border-slate-200 transition-colors">
                                            {new Date(sale.saleDate || sale.timestamp || '').toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {sale.vehicleNumber && (
                                            <span className="text-[10px] font-mono bg-slate-900 text-white px-1.5 py-0.5 rounded mt-1 inline-block opacity-80 group-hover:opacity-100 transition-opacity">
                                                {sale.vehicleNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
