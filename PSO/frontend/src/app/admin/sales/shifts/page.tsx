'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useSocket, useSocketEvent } from '@/lib/socket';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Clock, User, Banknote, Droplet, Calendar, ChevronDown } from 'lucide-react';

interface Shift {
    id: string;
    shiftType: 'MORNING' | 'EVENING' | 'NIGHT';
    startTime: string;
    endTime?: string;
    status: 'ACTIVE' | 'CLOSED';
    operator: {
        id: string;
        fullName: string;
        username: string;
    };
    totalSales: number;
    totalLiters: number;
    cashCollected: number;
    cardPayments: number;
    creditSales: number;
}

export default function ShiftReportsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { showToast } = useToast();

    const { connect } = useSocket();

    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedShift, setExpandedShift] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }

        // Ensure socket is connected
        if (user) {
            connect(user.id, user.role, user.username);
        }

        loadShifts();
    }, [isAuthenticated, user, router, connect]);

    // Listen for real-time shift updates
    useSocketEvent('shift:update', () => {
        loadShifts();
    });

    const loadShifts = async () => {
        try {
            // Load all daily shifts (active and completed)
            const data = await api.getDailyShifts();
            setShifts(data || []);
        } catch (error) {
            console.error('Failed to load shifts:', error);
            showToast('Failed to load shift data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getShiftColor = (type: string) => {
        switch (type) {
            case 'MORNING': return 'bg-amber-100 text-amber-700';
            case 'EVENING': return 'bg-purple-100 text-purple-700';
            case 'NIGHT': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Shift Reports</h1>
                    <p className="text-[var(--text-secondary)]">View operator shift performance and summaries</p>
                </div>
                <div className="flex gap-2">
                    <select className="input w-40">
                        <option>Today</option>
                        <option>Yesterday</option>
                        <option>This Week</option>
                        <option>This Month</option>
                    </select>
                </div>
            </div>

            {/* Active Shifts */}
            <Card>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Active Shifts
                </h3>

                {shifts.filter(s => s.status === 'ACTIVE').length === 0 ? (
                    <p className="text-[var(--text-secondary)] text-center py-8">No active shifts</p>
                ) : (
                    <div className="space-y-3">
                        {shifts.filter(s => s.status === 'ACTIVE').map((shift) => (
                            <div
                                key={shift.id}
                                className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {shift.operator?.fullName?.charAt(0) || 'O'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)]">
                                                {shift.operator?.fullName || 'Unknown Operator'}
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                Started {new Date(shift.startTime).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="success">{shift.shiftType}</Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-2 bg-white rounded-lg">
                                        <p className="text-xs text-[var(--text-secondary)]">Sales</p>
                                        <p className="font-bold text-[var(--text-primary)]">
                                            Rs {(shift.totalSales || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded-lg">
                                        <p className="text-xs text-[var(--text-secondary)]">Liters</p>
                                        <p className="font-bold text-[var(--text-primary)]">
                                            {(shift.totalLiters || 0).toFixed(1)} L
                                        </p>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded-lg">
                                        <p className="text-xs text-[var(--text-secondary)]">Cash</p>
                                        <p className="font-bold text-[var(--text-primary)]">
                                            Rs {(shift.cashCollected || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Completed Shifts Today */}
            <Card>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                    Completed Shifts
                </h3>

                {shifts.filter(s => s.status === 'CLOSED').length === 0 ? (
                    <p className="text-[var(--text-secondary)] text-center py-8">No completed shifts today</p>
                ) : (
                    <div className="space-y-2">
                        {shifts.filter(s => s.status === 'CLOSED').map((shift) => (
                            <div
                                key={shift.id}
                                className="p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--surface)] transition-colors cursor-pointer"
                                onClick={() => setExpandedShift(expandedShift === shift.id ? null : shift.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-[var(--text-muted)]" />
                                        <span className="font-medium">{shift.operator?.fullName}</span>
                                        <Badge variant="info">{shift.shiftType}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold">Rs {shift.totalSales.toLocaleString()}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedShift === shift.id ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {expandedShift === shift.id && (
                                    <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-[var(--text-secondary)]">Duration</p>
                                            <p className="font-medium">
                                                {new Date(shift.startTime).toLocaleTimeString()} - {shift.endTime ? new Date(shift.endTime).toLocaleTimeString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[var(--text-secondary)]">Liters Sold</p>
                                            <p className="font-medium">{shift.totalLiters.toFixed(2)} L</p>
                                        </div>
                                        <div>
                                            <p className="text-[var(--text-secondary)]">Card Payments</p>
                                            <p className="font-medium">Rs {shift.cardPayments.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[var(--text-secondary)]">Credit Sales</p>
                                            <p className="font-medium">Rs {shift.creditSales.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
