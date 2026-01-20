'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useSocketEvent } from '@/lib/socket';
import {
    ArrowLeft,
    TrendingUp,
    Droplet,
    Banknote,
    CreditCard,
    Clock,
    Target,
    Award,
    Star,
    Zap,
    Trophy
} from 'lucide-react';

interface ShiftStats {
    id: string;
    totalSales: number;
    totalLiters: number;
    cashCollected: number;
    startTime: string;
}

export default function OperatorStatsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<ShiftStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [shiftDuration, setShiftDuration] = useState({ hours: 0, minutes: 0 });

    const loadStats = useCallback(async () => {
        try {
            const shift = await api.getActiveShift();
            setStats(shift);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Real-time: Refresh stats when new sale is recorded
    useSocketEvent('sale:new', () => {
        loadStats();
    });

    useEffect(() => {
        if (!stats) return;

        const updateDuration = () => {
            const start = new Date(stats.startTime);
            const now = new Date();
            const diff = now.getTime() - start.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setShiftDuration({ hours, minutes });
        };

        updateDuration();
        const interval = setInterval(updateDuration, 60000);
        return () => clearInterval(interval);
    }, [stats]);


    // Target calculations
    const TARGET = 50000;
    const progress = stats ? Math.min(100, (stats.totalSales / TARGET) * 100) : 0;
    const remaining = stats ? Math.max(0, TARGET - stats.totalSales) : TARGET;

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center min-h-[60vh]">
                <div className="op-spinner"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative flex flex-col items-center justify-center p-6 text-center">
                {/* Background Pattern */}
                <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0, 12px 12px'
                    }}>
                </div>

                <div className="relative z-10 max-w-sm w-full bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 mx-auto rotate-3">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Shift</h2>
                    <p className="text-slate-500 font-medium">Start a shift to see your performance statistics.</p>
                    <button
                        onClick={() => router.push('/operator/shift-start')}
                        className="w-full mt-8 h-12 bg-slate-900 text-white rounded-xl font-bold hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20"
                    >
                        Start Shift
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative pb-24">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 p-4 max-w-lg mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 pt-2">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Performance</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Shift Progress Card */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 shadow-2xl shadow-slate-900/20">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                                <Target className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold tracking-wide">Shift Goal</span>
                            </div>
                            <span className="font-mono text-xs opacity-60 bg-black/20 px-2 py-1 rounded-md">
                                {shiftDuration.hours}h {shiftDuration.minutes}m active
                            </span>
                        </div>

                        {/* Target Progress */}
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Target</span>
                                    <span className="text-2xl font-bold tracking-tight">Rs {TARGET.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-emerald-400">{progress.toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mt-3 text-slate-400">
                                <span>Current: Rs {stats.totalSales.toLocaleString()}</span>
                                <span>Left: Rs {remaining.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md text-center">
                            {progress >= 100 ? (
                                <span className="flex items-center justify-center gap-2 font-bold text-amber-400">
                                    <Trophy className="w-5 h-5" />
                                    Target Achieved! Outstanding!
                                </span>
                            ) : progress >= 75 ? (
                                <span className="flex items-center justify-center gap-2 font-bold text-orange-400">
                                    <Zap className="w-5 h-5" />
                                    You're on fire! Almost there!
                                </span>
                            ) : progress >= 50 ? (
                                <span className="flex items-center justify-center gap-2 font-bold text-blue-400">
                                    <Award className="w-5 h-5" />
                                    Halfway there! Keep pushing!
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 font-bold text-slate-300">
                                    <Star className="w-5 h-5" />
                                    Let's hit that target today!
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Today's Breakdown */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        Today's Breakdown
                    </h2>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-lg font-bold text-slate-900 tracking-tight">
                                {Math.round(stats.totalSales / 1000)}k
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-lg font-bold text-slate-900 tracking-tight">
                                {Math.round(stats.totalLiters)}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Liters</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-lg font-bold text-slate-900 tracking-tight">
                                -
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Txns</p>
                        </div>
                    </div>

                    {/* Fuel Type Breakdown */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-orange-600">
                                    <Droplet className="w-4 h-4" fill="currentColor" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Petrol</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">Rs {Math.round(stats.totalSales * 0.65).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-teal-50 rounded-2xl border border-teal-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-teal-600">
                                    <Droplet className="w-4 h-4" fill="currentColor" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Diesel</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">Rs {Math.round(stats.totalSales * 0.35).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Payment Method Breakdown */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                                    <Banknote className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cash</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {Math.round(stats.cashCollected / stats.totalSales * 100) || 0}%
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-slate-900">Rs {stats.cashCollected.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Card</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {100 - (Math.round(stats.cashCollected / stats.totalSales * 100) || 0)}%
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-slate-900">Rs {(stats.totalSales - stats.cashCollected).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
