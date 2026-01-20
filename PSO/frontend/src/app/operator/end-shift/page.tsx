'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useLanguageStore } from '@/lib/store/languageStore';
import { useTranslation } from '@/lib/translations';
import {
    CheckCircle,
    Clock,
    Droplet,
    Banknote,
    CreditCard,
    AlertTriangle,
    ArrowLeft
} from 'lucide-react';

interface ShiftSummary {
    shiftId: string;
    shiftType: string;
    duration: string;
    totalSales: number;
    totalLiters: number;
    cashCollected: number;
    cardPayments: number;
    creditSales: number;
    cashVariance: number;
    fuelVariance: number;
}

export default function EndShiftPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { showToast } = useToast();
    const { language } = useLanguageStore();
    const t = useTranslation(language);

    const [shiftId, setShiftId] = useState<string | null>(null);
    const [summary, setSummary] = useState<ShiftSummary | null>(null);
    const [closingCash, setClosingCash] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load active shift data
    useState(() => {
        const loadShift = async () => {
            try {
                const shift = await api.getActiveShift();
                if (shift) {
                    setShiftId(shift.id);
                    // Pre-calculate summary from shift data
                    setSummary({
                        shiftId: shift.id,
                        shiftType: shift.shiftType,
                        duration: calculateDuration(shift.startTime),
                        totalSales: shift.totalSales || 0,
                        totalLiters: shift.totalLiters || 0,
                        cashCollected: shift.cashCollected || 0,
                        cardPayments: shift.cardPayments || 0,
                        creditSales: shift.creditSales || 0,
                        cashVariance: 0,
                        fuelVariance: 0,
                    });
                }
            } catch (error) {
                console.error('Failed to load shift', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadShift();
    });

    const calculateDuration = (startTime: string): string => {
        const start = new Date(startTime);
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
    };

    const handleEndShift = async () => {
        if (!shiftId || !closingCash) {
            showToast('Please enter closing cash amount', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await api.endShift(shiftId, {
                closingCash: parseFloat(closingCash),
                closingPetrolLevel: 0, // These would come from tank readings
                closingDieselLevel: 0,
                notes: '',
            });

            showToast('Shift ended successfully!', 'success');

            // Redirect to home after short delay
            setTimeout(() => {
                router.push('/operator');
            }, 1500);
        } catch (error: any) {
            showToast(error.message || 'Failed to end shift', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const cashVariance = summary ? (parseFloat(closingCash) || 0) - summary.cashCollected : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="p-6 text-center">
                <p className="text-[var(--text-secondary)]">No active shift found</p>
                <Button onClick={() => router.push('/operator')} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 pt-4 px-4 max-w-lg mx-auto font-sans text-slate-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">End Shift</h1>
                        <p className="text-xs text-slate-500 font-medium">{summary.shiftType} Shift</p>
                    </div>
                </div>

                {/* Shift Summary Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-tight">Shift Summary</h2>
                                <p className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3" />
                                    Duration: {summary.duration}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-bold">Total Sales</p>
                                <p className="text-2xl font-bold tracking-tight">Rs {summary.totalSales.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-bold">Fuel Sold</p>
                                <p className="text-2xl font-bold tracking-tight">{summary.totalLiters.toFixed(1)} <span className="text-sm text-slate-500 font-normal">L</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        Payment Breakdown
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Banknote className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Cash</span>
                            </div>
                            <span className="font-bold text-slate-900">
                                Rs {summary.cashCollected.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Card</span>
                            </div>
                            <span className="font-bold text-slate-900">
                                Rs {summary.cardPayments.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Droplet className="w-4 h-4 text-amber-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">Credit</span>
                            </div>
                            <span className="font-bold text-slate-900">
                                Rs {summary.creditSales.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Closing Cash Input */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        Enter Closing Cash
                    </h3>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                            Rs
                        </span>
                        <input
                            type="number"
                            placeholder="0"
                            value={closingCash}
                            onChange={(e) => setClosingCash(e.target.value)}
                            className="w-full h-16 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-center"
                        />
                    </div>

                    {/* Variance Display */}
                    {closingCash && (
                        <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 border ${cashVariance === 0
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : cashVariance > 0
                                ? 'bg-blue-50 border-blue-100 text-blue-700'
                                : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                            {cashVariance === 0 ? (
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            )}
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                                    {cashVariance === 0 ? 'Perfect Match' : cashVariance > 0 ? 'Storage Overage' : 'Shortage'}
                                </p>
                                <p className="font-bold text-sm">
                                    Variance: Rs {Math.abs(cashVariance).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-3">
                    <button
                        onClick={handleEndShift}
                        disabled={isSubmitting || !closingCash}
                        className="w-full h-16 bg-red-600 text-white rounded-2xl font-bold text-lg tracking-wide hover:bg-red-700 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:shadow-none group"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>END SHIFT</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="w-full py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
