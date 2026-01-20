'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { getPendingSalesCount } from '@/lib/offline-store';
import { forceSyncNow } from '@/lib/sync-manager';

export function OfflineIndicator() {
    const { isOnline, wasOffline } = useOnlineStatus();
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Load pending count on mount and listen for changes
    useEffect(() => {
        const loadPendingCount = async () => {
            try {
                const count = await getPendingSalesCount();
                setPendingCount(count);
            } catch (e) {
                console.error('Failed to get pending count:', e);
            }
        };

        loadPendingCount();

        // Listen for offline sale events
        const handleSaleAdded = () => loadPendingCount();
        const handleSaleSynced = () => loadPendingCount();
        const handleSyncStarted = () => setIsSyncing(true);
        const handleSyncCompleted = (e: CustomEvent) => {
            setIsSyncing(false);
            loadPendingCount();
            if (e.detail.synced > 0) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        };

        window.addEventListener('offline-sale-added', handleSaleAdded);
        window.addEventListener('offline-sale-synced', handleSaleSynced);
        window.addEventListener('sync-started', handleSyncStarted);
        window.addEventListener('sync-completed', handleSyncCompleted as EventListener);

        return () => {
            window.removeEventListener('offline-sale-added', handleSaleAdded);
            window.removeEventListener('offline-sale-synced', handleSaleSynced);
            window.removeEventListener('sync-started', handleSyncStarted);
            window.removeEventListener('sync-completed', handleSyncCompleted as EventListener);
        };
    }, []);

    // Auto-load when coming back online
    useEffect(() => {
        if (wasOffline && isOnline) {
            getPendingSalesCount().then(setPendingCount);
        }
    }, [wasOffline, isOnline]);

    const handleManualSync = async () => {
        if (!isOnline || isSyncing) return;
        setIsSyncing(true);
        try {
            await forceSyncNow();
        } finally {
            setIsSyncing(false);
            const count = await getPendingSalesCount();
            setPendingCount(count);
        }
    };

    // Don't show anything if online with no pending sales
    if (isOnline && pendingCount === 0 && !showSuccess) {
        return null;
    }

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
                {/* Offline Banner */}
                {!isOnline && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30 animate-in slide-in-from-bottom duration-300">
                        <WifiOff className="w-5 h-5" />
                        <div>
                            <p className="font-bold text-sm">You're Offline</p>
                            <p className="text-xs opacity-90">Sales will sync when connected</p>
                        </div>
                        {pendingCount > 0 && (
                            <div className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                                {pendingCount} pending
                            </div>
                        )}
                    </div>
                )}

                {/* Pending Sales Badge (when online) */}
                {isOnline && pendingCount > 0 && !showSuccess && (
                    <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95"
                    >
                        {isSyncing ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <div className="text-left">
                            <p className="font-bold text-sm">
                                {isSyncing ? 'Syncing...' : `${pendingCount} Sales Pending`}
                            </p>
                            <p className="text-xs opacity-90">
                                {isSyncing ? 'Please wait' : 'Tap to sync now'}
                            </p>
                        </div>
                    </button>
                )}

                {/* Success Message */}
                {showSuccess && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30 animate-in slide-in-from-bottom duration-300">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-bold text-sm">All sales synced!</p>
                    </div>
                )}

                {/* Just came back online */}
                {wasOffline && isOnline && pendingCount === 0 && !showSuccess && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30 animate-in slide-in-from-bottom duration-300">
                        <Wifi className="w-5 h-5" />
                        <p className="font-bold text-sm">Back Online!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
