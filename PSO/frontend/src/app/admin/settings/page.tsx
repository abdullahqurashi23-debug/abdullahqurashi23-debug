'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';

interface FuelPrices {
    PETROL: number;
    DIESEL: number;
}

export default function SettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPumpInfo, setSavingPumpInfo] = useState(false);
    const [fuelPrices, setFuelPrices] = useState<FuelPrices>({ PETROL: 263.45, DIESEL: 265.65 });
    const [tanks, setTanks] = useState<any[]>([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Pump info (would be from settings in production)
    const [pumpInfo, setPumpInfo] = useState({
        name: 'PSO Al-Rehman Filling Station',
        address: 'Main GT Road, Karachi',
        phone: '021-XXXXXXX',
        taxRate: '17',
    });

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        loadSettings();
    }, [isAuthenticated, user, router]);

    const loadSettings = async () => {
        try {
            const [prices, tankData] = await Promise.all([
                api.getFuelPrices(),
                api.getTankStats(),
            ]);
            setFuelPrices(prices);
            setTanks(tankData);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePrices = async () => {
        setSaving(true);
        try {
            // Update prices one by one
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/sales/prices/petrol`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ price: fuelPrices.PETROL }),
            });

            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/sales/prices/diesel`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ price: fuelPrices.DIESEL }),
            });

            setMessage({ type: 'success', text: 'Fuel prices updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update prices' });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePumpInfo = async () => {
        setSavingPumpInfo(true);
        try {
            await api.updatePumpInfo(pumpInfo);
            setMessage({ type: 'success', text: 'Pump information updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update pump info' });
        } finally {
            setSavingPumpInfo(false);
        }
    };

    const handleResetShiftData = () => {
        if (confirm('⚠️ WARNING: This will delete ALL shift data. This action cannot be undone. Are you absolutely sure?')) {
            if (confirm('Please confirm again. ALL shift records will be permanently deleted.')) {
                setMessage({ type: 'success', text: 'Feature coming soon - contact support for data reset' });
            }
        }
    };

    const handleExportBackup = () => {
        setMessage({ type: 'success', text: 'Preparing database export... This feature will be available in a future update.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] pb-20">
            {/* Header */}
            <header className="bg-[var(--background)] border-b border-[var(--border)] sticky top-[var(--header-height)] z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/admin" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        ← Back
                    </Link>
                    <div>
                        <h1 className="text-[var(--text-h2)] font-bold text-[var(--text-primary)]">Settings</h1>
                        <p className="text-[var(--text-secondary)]">Configure pump settings and prices</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Success/Error Message */}
                {message.text && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                {/* Fuel Prices */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                            ⛽
                        </div>
                        <div>
                            <h2 className="text-[var(--text-h3)] font-bold">Fuel Prices</h2>
                            <p className="text-[var(--text-secondary)] text-sm">Update prices when OGRA announces new rates</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Petrol (Rs per Liter)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-medium z-10 pointer-events-none">Rs</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={fuelPrices.PETROL}
                                    onChange={(e) => setFuelPrices({ ...fuelPrices, PETROL: parseFloat(e.target.value) })}
                                    className="input w-full !pl-12 text-lg font-bold text-[var(--text-primary)]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Diesel (Rs per Liter)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-medium z-10 pointer-events-none">Rs</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={fuelPrices.DIESEL}
                                    onChange={(e) => setFuelPrices({ ...fuelPrices, DIESEL: parseFloat(e.target.value) })}
                                    className="input w-full !pl-12 text-lg font-bold text-[var(--text-primary)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSavePrices}
                            disabled={saving}
                            className="btn btn-primary min-w-[150px]"
                        >
                            {saving ? 'Saving...' : 'Update Prices'}
                        </button>
                    </div>
                </div>

                {/* Tank Configuration */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-xl">
                            🛢️
                        </div>
                        <div>
                            <h2 className="text-[var(--text-h3)] font-bold">Tank Configuration</h2>
                            <p className="text-[var(--text-secondary)] text-sm">Monitor fuel tank levels and capacity</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {tanks.map((tank) => (
                            <div key={tank.fuelType} className="p-5 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-bold text-lg text-[var(--text-primary)]">{tank.fuelType} Tank</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${tank.isLow
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {tank.isLow ? '⚠️ Low Level' : '✓ Normal Level'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                                        <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wide mb-1">Capacity</p>
                                        <p className="font-bold text-[var(--text-primary)]">{tank.capacity.toLocaleString()} L</p>
                                    </div>
                                    <div className="text-center p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                                        <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wide mb-1">Current Level</p>
                                        <p className="font-bold text-[var(--color-primary)]">{tank.currentLevel.toLocaleString()} L</p>
                                    </div>
                                    <div className="text-center p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                                        <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wide mb-1">Status</p>
                                        <p className="font-bold text-[var(--text-primary)]">{tank.percentageFull.toFixed(1)}% Full</p>
                                    </div>
                                </div>
                                {/* Visual Progress Bar */}
                                <div className="w-full bg-[var(--border)] h-2 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${tank.fuelType === 'PETROL' ? 'bg-red-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${tank.percentageFull}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pump Information */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-xl">
                            🏢
                        </div>
                        <div>
                            <h2 className="text-[var(--text-h3)] font-bold">Pump Information</h2>
                            <p className="text-[var(--text-secondary)] text-sm">General station details</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Pump Name</label>
                            <input
                                type="text"
                                value={pumpInfo.name}
                                onChange={(e) => setPumpInfo({ ...pumpInfo, name: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Address</label>
                            <input
                                type="text"
                                value={pumpInfo.address}
                                onChange={(e) => setPumpInfo({ ...pumpInfo, address: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Phone</label>
                                <input
                                    type="text"
                                    value={pumpInfo.phone}
                                    onChange={(e) => setPumpInfo({ ...pumpInfo, phone: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">GST Rate (%)</label>
                                <input
                                    type="text"
                                    value={pumpInfo.taxRate}
                                    onChange={(e) => setPumpInfo({ ...pumpInfo, taxRate: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            onClick={handleSavePumpInfo}
                            disabled={savingPumpInfo}
                            className="btn btn-primary min-w-[150px]"
                        >
                            {savingPumpInfo ? 'Saving...' : 'Save Pump Info'}
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-2xl p-6 border border-red-200 bg-red-50">
                    <h2 className="text-[var(--text-h3)] font-bold mb-2 text-red-700 flex items-center gap-2">
                        ⚠️ Danger Zone
                    </h2>
                    <p className="text-red-600/80 text-sm mb-6">
                        These actions are irreversible. Please be careful.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleResetShiftData}
                            className="w-full px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-left hover:bg-red-50 transition-colors font-medium"
                        >
                            Reset All Shift Data
                        </button>
                        <button
                            onClick={handleExportBackup}
                            className="w-full px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-left hover:bg-red-50 transition-colors font-medium"
                        >
                            Export Complete Database Backup
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
