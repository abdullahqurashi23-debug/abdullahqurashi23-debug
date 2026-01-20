'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket, useSocketEvent } from '@/lib/socket';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import {
    Banknote,
    Droplet,
    Users,
    Wallet,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { TankWidget } from '@/components/dashboard/TankWidget';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { SalesChartWidget } from '@/components/dashboard/SalesChartWidget';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { TankPredictionWidget } from '@/components/dashboard/TankPredictionWidget';

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const { connect, isConnected } = useSocket();

    const [stats, setStats] = useState<any>(null);
    const [tanks, setTanks] = useState<any[]>([]);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [bankingData, setBankingData] = useState<any>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Data loading function
    const loadData = useCallback(async () => {
        try {
            const [dashboardStats, tankStats, sales, analytics, cashFlow, tankPredictions] = await Promise.all([
                api.getDashboardStats().catch(() => null),
                api.getTankStats().catch(() => []),
                api.getTodaySales().catch(() => ({ sales: [] })),
                api.getAnalytics('7days').catch(() => []),
                api.getCashFlow().catch(() => null),
                api.getTankPredictions().catch(() => []),
            ]);

            if (dashboardStats) setStats(dashboardStats);
            if (tankStats) setTanks(tankStats);
            setRecentSales(sales?.sales?.slice(0, 10) || []);
            if (analytics) setAnalyticsData(analytics);
            if (cashFlow) setBankingData(cashFlow);
            if (tankPredictions) setPredictions(tankPredictions);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [setStats, setTanks, setRecentSales, setAnalyticsData, setBankingData, setPredictions, setLoading]);

    // Initial load & socket connection
    useEffect(() => {
        if (user) {
            connect(user.id, user.role, user.username);
            loadData();

            // Refresh periodically as backup
            const interval = setInterval(() => {
                console.log('🔄 Periodic dashboard refresh');
                loadData();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [user, connect, loadData]);

    // Real-time Updates
    useSocketEvent('sale:new', () => {
        loadData();
        // Also update tanks immediately for better UX
        api.getTankStats().then(setTanks);
    });

    useSocketEvent('tank:update', (updatedTank: any) => {
        setTanks(prev => prev.map(t => t.fuelType === updatedTank.fuelType ? updatedTank : t));
    });

    useSocketEvent('shift:update', () => {
        // Refresh dashboard stats to show correct active shift count
        api.getDashboardStats().then(setStats);
        api.getTankStats().then(setTanks);
    });

    useSocketEvent('operators:active', (data: { count: number, operators: any[] }) => {
        // This is real-time socket connection count
        console.log('Active operators connected:', data.count);
    });

    // Credit approval requests from operators
    useSocketEvent('credit:approval_needed', (data: { operatorName: string; customerName: string; amount: number }) => {
        // Show notification for credit approval request
        console.log(`💳 Credit approval request from ${data.operatorName} for ${data.customerName}: Rs ${data.amount}`);
        // Could integrate with a toast/notification system here
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Credit Approval Needed', {
                body: `${data.operatorName} requests Rs ${data.amount.toLocaleString()} credit for ${data.customerName}`,
                icon: '/favicon.ico'
            });
        }
    });

    if (loading) {
        return <div className="p-8 text-center text-[var(--text-secondary)]">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Overview of station performance</p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${isConnected
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                        {isConnected ? 'LIVE SYSTEM' : 'OFFLINE'}
                    </span>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <Banknote className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +{stats?.percentageChange || '0'}%
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Sales</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                            Rs {stats?.todaySales?.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-teal-50 rounded-xl group-hover:bg-teal-100 transition-colors">
                            <Droplet className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuel Sold is Liters</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                            {stats?.todayLiters?.toLocaleString()} <span className="text-sm font-medium text-slate-400">L</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-bold">
                            {stats?.todayTransactions} Transactions
                        </p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                            {stats?.activeOperators}/8 Active
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                            {stats?.activeOperators}
                        </h3>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                            <Wallet className="w-6 h-6 text-amber-600" />
                        </div>
                        <button className="text-xs font-bold text-slate-900 hover:text-blue-600 hover:underline">
                            Deposit
                        </button>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash in Hand</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                            Rs {stats?.cashInHand?.toLocaleString()}
                        </h3>
                        <p className="text-xs text-amber-600 mt-1 font-bold">
                            Needs Deposit
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[300px] lg:h-[400px]">
                {/* Sales Chart (2 cols) */}
                <div className="lg:col-span-2 h-[300px] lg:h-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <SalesChartWidget data={analyticsData} />
                </div>

                {/* Live Activity (1 col) */}
                <div className="h-[300px] lg:h-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 shadow-sm overflow-hidden">
                    <LiveActivityFeed activities={recentSales} />
                </div>
            </div>

            {/* Bottom Section: Tank Levels & Banking Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <TankWidget data={tanks} />
                </div>

                {/* Banking Summary - Dark Style */}
                <div className="h-[300px] bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Banking Summary</h3>
                            <button className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                                View Report
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 h-full content-center">
                            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md group-hover:bg-white/10 transition-colors duration-300">
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Cash in Hand</p>
                                <h3 className="text-xl font-bold tracking-tight">
                                    Rs {bankingData?.cashInHand?.toLocaleString() || '0'}
                                </h3>
                            </div>
                            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md group-hover:bg-white/10 transition-colors duration-300">
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Sales Cash</p>
                                <h3 className="text-xl font-bold tracking-tight">
                                    Rs {bankingData?.cashFromSales?.toLocaleString() || '0'}
                                </h3>
                            </div>
                            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md group-hover:bg-white/10 transition-colors duration-300">
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Deposited</p>
                                <h3 className="text-lg font-bold tracking-tight text-emerald-400">
                                    Rs {bankingData?.deposited?.toLocaleString() || '0'}
                                </h3>
                            </div>
                            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md group-hover:bg-white/10 transition-colors duration-300">
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Expenses</p>
                                <h3 className="text-xl font-bold tracking-tight text-red-400">
                                    Rs {bankingData?.expenses?.toLocaleString() || '0'}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Alerts */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <AlertsWidget tanks={tanks} />
                </div>
            </div>
        </div>
    );
}
