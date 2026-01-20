'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { useSocketEvent } from '@/lib/socket';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Droplet, AlertTriangle, TrendingUp, Plus, Truck } from 'lucide-react';

export default function InventoryPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { showToast } = useToast();

    const [tanks, setTanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);

    const loadTanks = useCallback(async () => {
        try {
            const data = await api.getTankStats();
            setTanks(data);
        } catch (error) {
            console.error('Failed to load tanks:', error);
            showToast('Failed to load tank data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        loadTanks();
    }, [isAuthenticated, user, router, loadTanks]);

    // Real-time: Update tank when level changes
    useSocketEvent('tank:update', (updatedTank: any) => {
        setTanks(prev => prev.map(t =>
            t.fuelType === updatedTank.fuelType ? { ...t, ...updatedTank } : t
        ));
    });

    // Real-time: Refresh tanks when new sale is recorded (affects tank levels)
    useSocketEvent('sale:new', () => {
        loadTanks();
    });


    const getTankStatus = (percentage: number) => {
        if (percentage >= 75) return { label: 'Healthy', variant: 'success' as const, color: 'green' };
        if (percentage >= 30) return { label: 'Normal', variant: 'info' as const, color: 'blue' };
        if (percentage >= 15) return { label: 'Low', variant: 'warning' as const, color: 'amber' };
        return { label: 'Critical', variant: 'danger' as const, color: 'red' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Inventory</h1>
                    <p className="text-xs md:text-sm text-[var(--text-secondary)]">Monitor tank levels and fuel stock</p>
                </div>
                <Button
                    icon={<Truck className="w-4 h-4" />}
                    onClick={() => setShowDeliveryModal(true)}
                    className="w-full md:w-auto justify-center"
                >
                    Record Delivery
                </Button>
            </div>

            {/* Tank Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tanks.map((tank) => {
                    const percentage = (tank.currentLevel / tank.capacity) * 100;
                    const status = getTankStatus(percentage);

                    return (
                        <Card key={tank.fuelType} className="relative overflow-hidden">
                            {/* Background Gradient */}
                            <div
                                className={`absolute inset-0 opacity-10 ${tank.fuelType === 'PETROL'
                                    ? 'bg-gradient-to-br from-orange-500 to-red-500'
                                    : 'bg-gradient-to-br from-teal-500 to-emerald-500'
                                    }`}
                            />

                            <div className="relative">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tank.fuelType === 'PETROL'
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-teal-100 text-teal-600'
                                            }`}>
                                            <Droplet className="w-6 h-6 fill-current" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                                {tank.fuelType}
                                            </h3>
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                Rs {tank.pricePerLiter}/L
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={status.variant}>
                                        {status.label}
                                    </Badge>
                                </div>

                                {/* Tank Level Gauge */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--text-secondary)]">Tank Level</span>
                                        <span className="font-bold text-[var(--text-primary)]">
                                            {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${tank.fuelType === 'PETROL'
                                                ? 'bg-gradient-to-r from-orange-400 to-red-500'
                                                : 'bg-gradient-to-r from-teal-400 to-emerald-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-[var(--surface)] rounded-lg">
                                        <p className="text-xs text-[var(--text-secondary)] mb-1">Current Level</p>
                                        <p className="text-lg font-bold text-[var(--text-primary)]">
                                            {Number(tank.currentLevel).toLocaleString()} L
                                        </p>
                                    </div>
                                    <div className="p-3 bg-[var(--surface)] rounded-lg">
                                        <p className="text-xs text-[var(--text-secondary)] mb-1">Capacity</p>
                                        <p className="text-lg font-bold text-[var(--text-primary)]">
                                            {Number(tank.capacity).toLocaleString()} L
                                        </p>
                                    </div>
                                </div>

                                {/* Warning Message */}
                                {percentage < 30 && (
                                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${percentage < 15
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-amber-50 text-amber-700'
                                        }`}>
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {percentage < 15
                                                ? 'CRITICAL: Order fuel immediately!'
                                                : 'Refill recommended in 2-3 days'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">Today's Consumption</p>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {tanks.reduce((acc, t) => acc + (t.todaySold || 0), 0).toFixed(0)} L
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">Last Delivery</p>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                {tanks[0]?.lastDelivery
                                    ? new Date(tanks[0].lastDelivery).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">Total Stock Value</p>
                            <p className="text-lg font-bold text-[var(--text-primary)]">
                                Rs {tanks.reduce((acc, t) => acc + (t.currentLevel * t.pricePerLiter), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
