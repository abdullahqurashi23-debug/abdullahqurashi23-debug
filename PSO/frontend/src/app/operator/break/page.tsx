'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pause, Play, Clock, Check, X } from 'lucide-react';
import { useSocket } from '@/lib/socket';
import { useAuthStore } from '@/lib/auth';

type BreakStatus = 'idle' | 'requesting' | 'approved' | 'active' | 'rejected';

const BREAK_DURATIONS = [15, 30, 45, 60];
const BREAK_REASONS = [
    { id: 'PRAYER', label: 'Prayer (Namaz)', icon: '🕌' },
    { id: 'LUNCH', label: 'Lunch/Meal', icon: '🍽️' },
    { id: 'RESTROOM', label: 'Restroom', icon: '🚻' },
    { id: 'PERSONAL', label: 'Personal', icon: '👤' },
];

export default function BreakRequestPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { socket, isConnected } = useSocket();

    const [duration, setDuration] = useState(30);
    const [reason, setReason] = useState('LUNCH');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<BreakStatus>('idle');
    const [remainingTime, setRemainingTime] = useState(0);
    const [breakEndTime, setBreakEndTime] = useState<Date | null>(null);

    // Calculate end time
    const getEndTime = () => {
        const end = new Date();
        end.setMinutes(end.getMinutes() + duration);
        return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Handle break request
    const handleRequestBreak = () => {
        if (!socket || !user) return;

        setStatus('requesting');

        // Emit break request to admin
        socket.emit('break:request', {
            operatorId: user.id,
            operatorName: user.fullName,
            duration,
            reason,
            notes,
        });

        // For demo: Auto-approve after 2 seconds (in production, admin would approve)
        setTimeout(() => {
            setStatus('approved');
        }, 2000);
    };

    // Start break after approval
    const handleStartBreak = () => {
        setStatus('active');
        setRemainingTime(duration * 60);
        const end = new Date();
        end.setMinutes(end.getMinutes() + duration);
        setBreakEndTime(end);
    };

    // End break early
    const handleEndBreak = () => {
        setStatus('idle');
        setRemainingTime(0);
        setBreakEndTime(null);
        router.push('/operator');
    };

    // Countdown timer for active break
    useEffect(() => {
        if (status !== 'active' || remainingTime <= 0) return;

        const timer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStatus('idle');
                    router.push('/operator');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, remainingTime, router]);

    // Format remaining time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // --- STATUS: REQUESTING ---
    if (status === 'requesting') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans text-slate-900 bg-slate-50 relative">
                {/* Background Pattern */}
                <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0, 12px 12px'
                    }}>
                </div>

                <div className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-xl font-bold mb-2">Requesting Break...</h2>
                    <p className="text-slate-500 font-medium">Waiting for admin approval</p>
                    <p className="text-xs text-slate-400 mt-4 font-semibold uppercase tracking-wider">
                        Typical response: 10-30s
                    </p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="w-full mt-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                        Cancel Request
                    </button>
                </div>
            </div>
        );
    }

    // --- STATUS: APPROVED ---
    if (status === 'approved') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans text-slate-900 bg-slate-50 relative">
                {/* Background Pattern */}
                <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0, 12px 12px'
                    }}>
                </div>

                <div className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 mx-auto animate-in zoom-in spin-in-12 duration-500">
                        <Check className="w-10 h-10 text-emerald-600" strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Break Approved!</h2>
                    <p className="text-slate-500 font-medium mb-1">Duration: <span className="text-slate-900 font-bold">{duration} min</span></p>
                    <p className="text-slate-500 font-medium">Ends at: {getEndTime()}</p>

                    <button
                        onClick={handleStartBreak}
                        className="w-full mt-8 h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                    >
                        <Pause className="w-5 h-5" />
                        Start Break
                    </button>

                    <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3 text-left">
                        <div className="p-1 bg-amber-100 rounded-full flex-shrink-0">
                            <Pause className="w-3 h-3 text-amber-700" />
                        </div>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Sales recording will be PAUSED. Please secure your cash before leaving.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- STATUS: ACTIVE ---
    if (status === 'active') {
        const progress = (remainingTime / (duration * 60)) * 100;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans text-slate-900 bg-slate-50 relative">
                {/* Background Pattern */}
                <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0, 12px 12px'
                    }}>
                </div>

                <div className="relative z-10 w-full max-w-sm">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-6 inline-flex p-4 bg-amber-50 rounded-2xl">
                            <Pause className="w-8 h-8 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">You're on Break</h2>

                        {/* Timer */}
                        <div className="my-8">
                            <p
                                className={`text-6xl font-bold tabular-nums tracking-tighter ${remainingTime < 300 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}
                            >
                                {formatTime(remainingTime)}
                            </p>
                            <p className="text-sm text-slate-500 font-medium mt-2 bg-slate-100 inline-block px-3 py-1 rounded-lg">
                                Return by {breakEndTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full mb-8">
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${remainingTime < 300 ? 'bg-amber-500' : 'bg-slate-900'}`}
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-3">
                                {Math.round(progress)}% Time Remaining
                            </p>
                        </div>

                        <button
                            onClick={handleEndBreak}
                            className="w-full text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-slate-300 transition-all shadow-sm"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            End Break Early
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                            <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm">System Locked</p>
                            <p className="text-xs text-slate-400">Sales cannot be recorded until break ends.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- STATUS: IDLE (Request Form) ---
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative pb-10">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 p-4 max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8 pt-2">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Request Break</h1>
                </div>

                {/* Status Card */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">Current Shift Status</span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 space-y-1 pl-1">
                        <p>Active since: <span className="text-slate-700">7:00 AM</span></p>
                        <p>Last break: <span className="text-slate-700">2h 15min ago</span></p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                        </div>
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Eligible for Break</p>
                    </div>
                </div>

                {/* Duration Selector */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Select Duration</p>
                    <div className="grid grid-cols-4 gap-3">
                        {BREAK_DURATIONS.map((mins) => (
                            <button
                                key={mins}
                                onClick={() => setDuration(mins)}
                                className={`py-4 rounded-xl text-center font-bold transition-all relative overflow-hidden ${duration === mins
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]'
                                    : 'bg-slate-50 text-slate-500 hover:bg-white hover:border-slate-300 border border-transparent'
                                    }`}
                            >
                                <span className="text-lg leading-none block mb-1">{mins}</span>
                                <span className="block text-[10px] opacity-60 font-semibold uppercase">min</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-4 font-medium flex items-center justify-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Break will end at: <span className="text-slate-900 font-bold">{getEndTime()}</span>
                    </p>
                </div>

                {/* Reason Selector */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Reason (Optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                        {BREAK_REASONS.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setReason(r.id)}
                                className={`p-4 rounded-xl text-left transition-all flex items-center gap-3 border ${reason === r.id
                                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                    }`}
                            >
                                <span className="text-xl shadow-sm bg-white rounded-md p-1">{r.icon}</span>
                                <span className={`text-sm font-bold ${reason === r.id ? 'text-blue-900' : 'text-slate-600'}`}>
                                    {r.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-sm mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Notes (Optional)</p>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional information..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
                    />
                </div>

                {/* Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 md:static md:bg-transparent md:border-none md:p-0">
                    <button
                        onClick={handleRequestBreak}
                        disabled={!isConnected}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg tracking-wide hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
                    >
                        <Pause className="w-5 h-5" />
                        Request Break
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-3 font-semibold uppercase tracking-wider">
                        Admin will be notified instantly
                    </p>
                </div>
            </div>
        </div>
    );
}
