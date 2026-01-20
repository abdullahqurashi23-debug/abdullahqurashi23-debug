'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema
interface PumpOfflineDB extends DBSchema {
    pendingSales: {
        key: string;
        value: {
            id: string;
            fuelType: string;
            liters: number;
            totalAmount: number;
            paymentMethod: string;
            shiftId: string;
            vehicleNumber?: string;
            customerName?: string;
            timestamp: string;
            syncStatus: 'pending' | 'syncing' | 'failed';
            retryCount: number;
            createdAt: string;
        };
        indexes: { 'by-status': string };
    };
    cachedData: {
        key: string;
        value: {
            key: string;
            data: any;
            timestamp: string;
        };
    };
}

const DB_NAME = 'pso-pump-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<PumpOfflineDB> | null = null;

// Initialize the database
async function getDB(): Promise<IDBPDatabase<PumpOfflineDB>> {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB<PumpOfflineDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Pending sales store
            if (!db.objectStoreNames.contains('pendingSales')) {
                const salesStore = db.createObjectStore('pendingSales', { keyPath: 'id' });
                salesStore.createIndex('by-status', 'syncStatus');
            }

            // Cached data store (for tank levels, prices, etc.)
            if (!db.objectStoreNames.contains('cachedData')) {
                db.createObjectStore('cachedData', { keyPath: 'key' });
            }
        },
    });

    return dbInstance;
}

// ==================== PENDING SALES ====================

export interface PendingSale {
    id: string;
    fuelType: string;
    liters: number;
    totalAmount: number;
    paymentMethod: string;
    shiftId: string;
    vehicleNumber?: string;
    customerName?: string;
    timestamp: string;
    syncStatus: 'pending' | 'syncing' | 'failed';
    retryCount: number;
    createdAt: string;
}

// Add a sale to pending queue
export async function addPendingSale(sale: Omit<PendingSale, 'id' | 'syncStatus' | 'retryCount' | 'createdAt'>): Promise<string> {
    const db = await getDB();
    const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const pendingSale: PendingSale = {
        ...sale,
        id,
        syncStatus: 'pending',
        retryCount: 0,
        createdAt: new Date().toISOString(),
    };

    await db.add('pendingSales', pendingSale);
    console.log('📦 Sale saved offline:', id);

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('offline-sale-added', { detail: pendingSale }));

    return id;
}

// Get all pending sales
export async function getPendingSales(): Promise<PendingSale[]> {
    const db = await getDB();
    return db.getAll('pendingSales');
}

// Get pending sales count
export async function getPendingSalesCount(): Promise<number> {
    const db = await getDB();
    return db.count('pendingSales');
}

// Update sale sync status
export async function updateSaleStatus(id: string, status: 'pending' | 'syncing' | 'failed', retryCount?: number): Promise<void> {
    const db = await getDB();
    const sale = await db.get('pendingSales', id);
    if (sale) {
        sale.syncStatus = status;
        if (retryCount !== undefined) sale.retryCount = retryCount;
        await db.put('pendingSales', sale);
    }
}

// Remove sale after successful sync
export async function removePendingSale(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('pendingSales', id);
    console.log('✅ Synced sale removed from offline store:', id);

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('offline-sale-synced', { detail: { id } }));
}

// Clear all failed sales
export async function clearFailedSales(): Promise<void> {
    const db = await getDB();
    const allSales = await db.getAllFromIndex('pendingSales', 'by-status', 'failed');
    for (const sale of allSales) {
        await db.delete('pendingSales', sale.id);
    }
}

// ==================== CACHED DATA ====================

// Cache data for offline use
export async function cacheData(key: string, data: any): Promise<void> {
    const db = await getDB();
    await db.put('cachedData', {
        key,
        data,
        timestamp: new Date().toISOString(),
    });
}

// Get cached data
export async function getCachedData<T>(key: string): Promise<T | null> {
    const db = await getDB();
    const cached = await db.get('cachedData', key);
    return cached?.data ?? null;
}

// Check if cached data is fresh (within maxAge minutes)
export async function isCacheFresh(key: string, maxAgeMinutes: number = 60): Promise<boolean> {
    const db = await getDB();
    const cached = await db.get('cachedData', key);
    if (!cached) return false;

    const age = Date.now() - new Date(cached.timestamp).getTime();
    return age < maxAgeMinutes * 60 * 1000;
}

// Clear all cached data
export async function clearCache(): Promise<void> {
    const db = await getDB();
    await db.clear('cachedData');
}

// ==================== UTILITY ====================

// Check if offline store is available
export function isOfflineStoreAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
}

// Get offline store stats
export async function getOfflineStats(): Promise<{
    pendingSalesCount: number;
    cachedDataCount: number;
    oldestPendingSale: string | null;
}> {
    const db = await getDB();
    const pendingSales = await db.getAll('pendingSales');
    const cachedDataCount = await db.count('cachedData');

    return {
        pendingSalesCount: pendingSales.length,
        cachedDataCount,
        oldestPendingSale: pendingSales.length > 0
            ? pendingSales.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0].createdAt
            : null,
    };
}
