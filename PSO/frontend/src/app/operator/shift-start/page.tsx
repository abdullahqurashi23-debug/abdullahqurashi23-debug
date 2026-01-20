'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useSocket, useSocketEvent } from '@/lib/socket';
import { api } from '@/lib/api';
import { Clock, Droplet, Banknote, FileText, Play } from 'lucide-react';

interface TankData {
    fuelType: string;
    currentLevel: number;
    capacity: number;
    percentageFull: number;
    pricePerLiter: number;
}

export default function ShiftStartPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { connect } = useSocket();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [tanks, setTanks] = useState<TankData[]>([]);
    const [openingCash, setOpeningCash] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Live clock
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Load tank data on mount
    const loadTanks = useCallback(async () => {
        try {
            const tankStats = await api.getTankStats();
            if (tankStats) setTanks(tankStats);
        } catch (error) {
            console.error('Failed to load tank stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTanks();
    }, [loadTanks]);

    // Real-time: Update tank levels when they change
    useSocketEvent('tank:update', (updatedTank: any) => {
        setTanks(prev => prev.map(t =>
            t.fuelType === updatedTank.fuelType ? { ...t, ...updatedTank } : t
        ));
    });


    // Get greeting based on time
    const hour = currentTime.getHours();
    const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

    // Format time and date
    const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    const dateString = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Get shift type
    const getShiftType = () => {
        if (hour >= 6 && hour < 14) return { name: 'Morning Shift', time: '7 AM - 3 PM', api: 'MORNING' };
        if (hour >= 14 && hour < 22) return { name: 'Evening Shift', time: '3 PM - 11 PM', api: 'EVENING' };
        return { name: 'Night Shift', time: '11 PM - 7 AM', api: 'NIGHT' };
    };
    const shift = getShiftType();

    // Handle start shift
    const handleStartShift = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const petrolTank = tanks.find(t => t.fuelType === 'PETROL');
            const dieselTank = tanks.find(t => t.fuelType === 'DIESEL');

            await api.startShift({
                shiftType: shift.api,
                openingCash: parseFloat(openingCash) || 0,
                openingPetrolLevel: petrolTank?.currentLevel || 0,
                openingDieselLevel: dieselTank?.currentLevel || 0,
            });

            // Connect to socket after successful shift start
            if (user) {
                connect(user.id, user.role, user.username);
            }

            // Redirect to main dashboard
            router.push('/operator');
        } catch (error) {
            console.error('Failed to start shift:', error);
            alert('Failed to start shift. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Get tank status color
    const getTankStatus = (percentage: number) => {
        if (percentage >= 75) return { label: 'Healthy', color: 'var(--op-success)' };
        if (percentage >= 30) return { label: 'Normal', color: 'var(--op-info)' };
        if (percentage >= 15) return { label: 'Low', color: 'var(--op-warning)' };
        return { label: 'Critical', color: 'var(--op-danger)' };
    };

    return (
        <div className="pb-32 pt-4 px-4 max-w-lg mx-auto font-sans text-slate-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                {/* Greeting Card - Glass Style */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 text-center shadow-lg shadow-slate-200/50">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
                        {greeting}, {user?.fullName?.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 font-medium">Ready to start your shift?</p>
                </div>

                {/* Shift Details - Glass Style */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-orange-500" />
                        </div>
                        <h2 className="font-bold text-slate-900">Shift Details</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</span>
                            <span className="font-bold text-slate-700">{dateString}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shift</span>
                            <span className="font-bold text-slate-700">{shift.name} ({shift.time})</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Time</span>
                            <span className="font-bold text-lg tabular-nums text-slate-900">{timeString}</span>
                        </div>
                    </div>
                </div>

                {/* Opening Tank Levels */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                            <Droplet className="w-4 h-4 text-teal-600" />
                        </div>
                        <h2 className="font-bold text-slate-900">Opening Tank Levels</h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tanks.map((tank) => {
                                const status = getTankStatus(tank.percentageFull);
                                const isPetrol = tank.fuelType === 'PETROL';

                                return (
                                    <div key={tank.fuelType} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-700">{tank.fuelType}</span>
                                            <span
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: status.color + '15',
                                                    color: status.color
                                                }}
                                            >
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isPetrol ? 'bg-orange-500' : 'bg-teal-500'}`}
                                                style={{ width: `${tank.percentageFull}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                                            <span>{tank.currentLevel.toLocaleString()} L</span>
                                            <span>{tank.percentageFull.toFixed(1)}% full</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium uppercase tracking-wider">
                                ⚡ Syncs every 5 seconds
                            </p>
                        </div>
                    )}
                </div>

                {/* Opening Cash */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Banknote className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h2 className="font-bold text-slate-900">Opening Cash (Optional)</h2>
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                            Rs
                        </span>
                        <input
                            type="number"
                            value={openingCash}
                            onChange={(e) => setOpeningCash(e.target.value)}
                            placeholder="0"
                            className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h2 className="font-bold text-slate-900">Notes (Optional)</h2>
                    </div>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any issues or observations?"
                        rows={3}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none"
                    />
                </div>

                {/* Start Shift Button - Login Style */}
                <button
                    onClick={handleStartShift}
                    disabled={submitting}
                    className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-lg tracking-wide hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:shadow-none group mt-4"
                >
                    {submitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                            <span>START SHIFT</span>
                        </>
                    )}
                </button>

                {/* Cancel Link */}
                <button
                    onClick={() => router.back()}
                    className="w-full py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
