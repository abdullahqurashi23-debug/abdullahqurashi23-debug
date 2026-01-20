'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useSocket, useSocketEvent } from '@/lib/socket';
import { api } from '@/lib/api';
import {
    Droplet,
    CreditCard,
    Clock,
    History,
    Pause,
    MessageSquare,
    TrendingUp,
    Fuel,
    Car,
    Power
} from 'lucide-react';

interface FuelPrices {
    PETROL: number;
    DIESEL: number;
}

interface TankData {
    fuelType: string;
    currentLevel: number;
    capacity: number;
    percentageFull: number;
}

export default function OperatorDashboard() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { connect, isConnected } = useSocket();

    const [activeShift, setActiveShift] = useState<any | null>(null);
    const [tanks, setTanks] = useState<TankData[]>([]);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [shiftDuration, setShiftDuration] = useState('0h 0m');

    // Load initial data
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'OPERATOR') {
            router.push('/login');
            return;
        }

        connect(user.id, user.role, user.username);
        loadInitialData();
    }, [isAuthenticated, user, router, connect]);

    // Update shift duration every minute
    useEffect(() => {
        if (!activeShift) return;

        const updateDuration = () => {
            const start = new Date(activeShift.startTime);
            const now = new Date();
            const diff = now.getTime() - start.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setShiftDuration(`${hours}h ${minutes}m`);
        };

        updateDuration();
        const interval = setInterval(updateDuration, 60000);
        return () => clearInterval(interval);
    }, [activeShift]);

    // Refresh tank data every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const tankData = await api.getTankStats();
                if (tankData) setTanks(tankData);
            } catch (error) {
                console.error('Failed to refresh tanks');
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Real-time sale updates
    useSocketEvent('sale:new', (sale: any) => {
        if (sale.operatorId === user?.id) {
            setRecentSales(prev => [sale, ...prev].slice(0, 5));
            setActiveShift((prev: any) => prev ? {
                ...prev,
                totalSales: prev.totalSales + sale.amount,
                totalLiters: prev.totalLiters + sale.liters,
            } : prev);
        }
    });

    // Real-time tank level updates
    useSocketEvent('tank:update', (updatedTank: any) => {
        setTanks(prev => prev.map(t =>
            t.fuelType === updatedTank.fuelType ? updatedTank : t
        ));
    });

    // Listen for shift-related updates
    useSocketEvent('shift:update', (data: any) => {
        if (data.operatorId === user?.id) {
            // Refresh shift data when there's an update
            api.getActiveShift().then(setActiveShift).catch(console.error);
        }
    });

    const loadInitialData = async () => {
        try {
            const [shiftData, salesData, tankData] = await Promise.all([
                api.getActiveShift().catch(() => null),
                api.getMyTodaySales().catch(() => ({ sales: [] })),
                api.getTankStats().catch(() => []),
            ]);

            setActiveShift(shiftData);
            setRecentSales(salesData?.sales?.slice(0, 5) || []);
            setTanks(tankData || []);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center min-h-[60vh]">
                <div className="op-spinner"></div>
            </div>
        );
    }

    // --- NO ACTIVE SHIFT: Redirect to shift start ---
    if (!activeShift) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center font-sans text-slate-900">
                {/* Background Pattern */}
                <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0, 12px 12px'
                    }}>
                </div>

                <div className="relative z-10 text-center animate-in fade-in zoom-in-95 duration-500 max-w-sm px-6">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-slate-200/50 border border-slate-100 mx-auto rotate-3">
                        <Clock className="w-10 h-10 text-slate-900" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                        No Active Shift
                    </h2>
                    <p className="text-slate-500 mb-10 font-medium leading-relaxed">
                        Previous shift has ended. Start a new shift to begin recording sales and tracking fuel.
                    </p>

                    <button
                        onClick={() => router.push('/operator/shift-start')}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg tracking-wide hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 group"
                    >
                        <span>Start New Shift</span>
                        <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="mt-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">PSO Station</p>
                    </div>
                </div>
            </div>
        );
    }

    // Quick Actions
    const quickActions = [
        { name: 'Credit Sales', icon: CreditCard, href: '/operator/credit', color: 'var(--op-warning)' },
        { name: 'History', icon: History, href: '/operator/history', color: 'var(--op-info)' },
        { name: 'Request Break', icon: Pause, href: '/operator/break', color: 'var(--op-secondary)' },
    ];

    // --- ACTIVE SHIFT: Main Dashboard ---
    return (
        <div className="relative min-h-screen pb-24 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
            {/* Background Pattern - Matching Login Page */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-500 p-4">

                {/* Shift Status Card - Refined Glass/Dark Style */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 shadow-2xl shadow-slate-900/20">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Fuel className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                                    ACTIVE SHIFT
                                </div>
                            </div>
                            <span className="font-mono text-sm tracking-wider opacity-80 bg-black/20 px-2 py-1 rounded-lg">{shiftDuration}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <p className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Total Revenue</p>
                                <p className="text-2xl font-bold tracking-tight text-white">
                                    Rs {(activeShift.totalSales || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <p className="text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Fuel Output</p>
                                <p className="text-2xl font-bold tracking-tight text-white">
                                    {(activeShift.totalLiters || 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">L</span>
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8">
                            <div className="flex justify-between text-[10px] mb-2 font-semibold uppercase tracking-wider text-slate-400">
                                <span>Daily Goal</span>
                                <span>{Math.min(100, ((activeShift.totalSales || 0) / 100000 * 100)).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(100, (activeShift.totalSales || 0) / 100000 * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 px-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Primary Action: New Sale - Login Button Style */}
                        <button
                            onClick={() => router.push('/operator/sale')}
                            className="col-span-2 h-20 bg-slate-900 text-white rounded-2xl font-bold text-lg tracking-wide hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-between px-8 border border-slate-800 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Fuel className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <span className="block leading-none">New Sale</span>
                                    <span className="text-xs font-medium text-slate-400 mt-1 block">Record Transaction</span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <TrendingUp className="w-4 h-4 rotate-45" />
                            </div>
                        </button>

                        {/* Secondary Actions - Clean White Style */}
                        {[
                            ...quickActions,
                            { name: 'End Shift', icon: Power, href: '/operator/end-shift', color: 'text-red-600', bg: 'bg-red-50', hover: 'group-hover:text-red-700' }
                        ].map((action) => {
                            const Icon = action.icon;
                            // Default styles if not provided
                            const colorClass = (action as any).color || 'text-slate-600';
                            const bgClass = (action as any).bg || 'bg-slate-100';
                            const hoverClass = (action as any).hover || 'group-hover:text-slate-900';

                            return (
                                <button
                                    key={action.name}
                                    onClick={() => router.push(action.href)}
                                    className="h-24 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:-translate-y-1 ${bgClass}`}
                                    >
                                        <Icon className={`w-5 h-5 ${colorClass} ${hoverClass}`} />
                                    </div>
                                    <span className={`text-xs font-bold ${colorClass.replace('text-', 'text-slate-600 ')} group-hover:text-slate-900`}>{action.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-500" />
                            Recent Activity
                        </h3>
                        <button onClick={() => router.push('/operator/history')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                            View All
                        </button>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden divide-y divide-slate-100">
                        {recentSales.map((sale) => {
                            const isPetrol = sale.fuelType === 'PETROL';
                            return (
                                <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-default group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isPetrol
                                            ? 'bg-orange-50 border-orange-100 text-orange-600 group-hover:bg-orange-100 group-hover:border-orange-200'
                                            : 'bg-teal-50 border-teal-100 text-teal-600 group-hover:bg-teal-100 group-hover:border-teal-200'
                                            }`}>
                                            <Droplet className="w-6 h-6" fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">Rs {(sale.totalAmount || sale.amount).toLocaleString()}</p>
                                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                                <span className="font-semibold text-slate-700">{sale.fuelType}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span>{Number(sale.liters).toFixed(2)}L</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                                        {new Date(sale.timestamp || sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}
                        {recentSales.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">No sales recorded yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
