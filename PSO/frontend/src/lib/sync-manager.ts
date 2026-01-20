'use client';

import { api } from '@/lib/api';
import {
    getPendingSales,
    updateSaleStatus,
    removePendingSale,
    PendingSale
} from '@/lib/offline-store';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

let isSyncing = false;
let syncInterval: NodeJS.Timeout | null = null;

// Start the sync manager
export function startSyncManager() {
    if (typeof window === 'undefined') return;

    console.log('🔄 Sync Manager started');

    // Listen for online event
    window.addEventListener('online', handleOnline);

    // Check for pending sales periodically
    syncInterval = setInterval(async () => {
        if (navigator.onLine && !isSyncing) {
            await syncPendingSales();
        }
    }, 30000); // Check every 30 seconds

    // Initial sync attempt
    if (navigator.onLine) {
        setTimeout(syncPendingSales, 2000);
    }
}

// Stop the sync manager
export function stopSyncManager() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    window.removeEventListener('online', handleOnline);
    console.log('⏹️ Sync Manager stopped');
}

// Handle coming back online
async function handleOnline() {
    console.log('🌐 Back online - starting sync...');
    // Small delay to ensure connection is stable
    setTimeout(syncPendingSales, 1000);
}

// Sync all pending sales
export async function syncPendingSales(): Promise<{
    synced: number;
    failed: number;
}> {
    if (isSyncing) {
        console.log('⏳ Sync already in progress...');
        return { synced: 0, failed: 0 };
    }

    isSyncing = true;
    let synced = 0;
    let failed = 0;

    try {
        const pendingSales = await getPendingSales();

        if (pendingSales.length === 0) {
            console.log('✅ No pending sales to sync');
            return { synced: 0, failed: 0 };
        }

        console.log(`🔄 Syncing ${pendingSales.length} pending sales...`);

        // Dispatch sync started event
        window.dispatchEvent(new CustomEvent('sync-started', {
            detail: { count: pendingSales.length }
        }));

        for (const sale of pendingSales) {
            if (sale.syncStatus === 'failed' && sale.retryCount >= MAX_RETRIES) {
                console.log(`⏭️ Skipping sale ${sale.id} - max retries exceeded`);
                failed++;
                continue;
            }

            try {
                await updateSaleStatus(sale.id, 'syncing');

                // Send to server
                await api.recordSale({
                    fuelType: sale.fuelType,
                    liters: sale.liters,
                    paymentMethod: sale.paymentMethod,
                    shiftId: sale.shiftId,
                    vehicleNumber: sale.vehicleNumber,
                    customerName: sale.customerName,
                });

                // Success - remove from pending
                await removePendingSale(sale.id);
                synced++;
                console.log(`✅ Synced sale ${sale.id}`);

            } catch (error) {
                console.error(`❌ Failed to sync sale ${sale.id}:`, error);
                await updateSaleStatus(sale.id, 'failed', sale.retryCount + 1);
                failed++;
            }
        }

        console.log(`📊 Sync complete: ${synced} synced, ${failed} failed`);

        // Dispatch sync completed event
        window.dispatchEvent(new CustomEvent('sync-completed', {
            detail: { synced, failed }
        }));

    } finally {
        isSyncing = false;
    }

    return { synced, failed };
}

// Force sync now
export async function forceSyncNow(): Promise<{
    synced: number;
    failed: number;
}> {
    if (!navigator.onLine) {
        console.log('📴 Cannot sync - offline');
        return { synced: 0, failed: 0 };
    }
    return syncPendingSales();
}

// Get sync status
export function getSyncStatus(): { isSyncing: boolean } {
    return { isSyncing };
}
