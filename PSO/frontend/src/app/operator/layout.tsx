'use client';

import { BottomNav } from '@/components/layout/BottomNav';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Fuel, Wifi, WifiOff } from 'lucide-react';
import { useSocketStore } from '@/lib/socket';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { startSyncManager, stopSyncManager } from '@/lib/sync-manager';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const [hasHydrated, setHasHydrated] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const isConnected = useSocketStore((state) => state.isConnected);

    // Wait for Zustand to hydrate from localStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            setHasHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Live clock
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Start sync manager for offline sales
    useEffect(() => {
        startSyncManager();
        return () => stopSyncManager();
    }, []);

    // Only check auth after hydration is complete
    useEffect(() => {
        if (!hasHydrated) return;

        if (!user) {
            router.push('/login');
        }
    }, [hasHydrated, user, router]);

    // Show loading while hydrating
    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    // Format time
    const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900 selection:bg-[var(--color-primary)] selection:text-white">

            {/* Operator Header - Enhanced */}
            <header className="h-16 bg-white px-4 flex items-center justify-between shadow-sm border-b border-slate-100 fixed top-0 left-0 right-0 z-40 bg-opacity-90 backdrop-blur-md transition-all duration-300">

                {/* Left: Station Info + Connection Status */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center border border-slate-800">
                        <Fuel className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-slate-900">PSO Station</h1>
                            {/* Connection indicator */}
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {isConnected ? 'LIVE' : 'OFFLINE'}
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Al-Rehman Filling</p>
                    </div>
                </div>

                {/* Right: Time, User Info, Notifications */}
                <div className="flex items-center gap-4">
                    {/* Live Clock */}
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold tabular-nums text-slate-900">{timeString}</p>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">{user.fullName}</p>
                    </div>

                    {/* Mobile: Show time only */}
                    <div className="sm:hidden text-right">
                        <p className="text-xs font-bold tabular-nums text-slate-900">{timeString}</p>
                    </div>

                    {/* Notifications Bell */}
                    <button
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors relative text-slate-600"
                        onClick={() => router.push('/operator/messages')}
                    >
                        <Bell className="w-5 h-5" />
                        {/* Unread indicator */}
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 px-4 min-h-screen animate-fade-up">
                <div className="max-w-md mx-auto w-full">
                    {children}
                </div>
            </main>

            <OfflineIndicator />
            <BottomNav />
        </div>
    );
}
