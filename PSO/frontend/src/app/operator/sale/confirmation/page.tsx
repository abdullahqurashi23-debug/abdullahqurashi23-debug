'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, MessageCircle, Fuel, ArrowLeft, Droplet } from 'lucide-react';

export default function SaleConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const saleId = searchParams.get('saleId');
    const amount = searchParams.get('amount');
    const liters = searchParams.get('liters');
    const fuel = searchParams.get('fuel');
    const payment = searchParams.get('payment');

    const [countdown, setCountdown] = useState(5);
    const [showConfetti, setShowConfetti] = useState(true);

    // Auto-redirect effect
    useEffect(() => {
        if (countdown <= 0) {
            router.push('/operator');
        }
    }, [countdown, router]);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Hide confetti after animation
    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const isPetrol = fuel === 'PETROL';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            {/* Success Animation */}
            <div className="mb-6">
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto op-animate-checkmark"
                    style={{ backgroundColor: 'var(--op-success)' }}
                >
                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[var(--op-success)] mb-2">
                Sale Recorded!
            </h1>
            <p className="text-[var(--op-gray-500)] mb-8">
                Transaction completed successfully
            </p>

            {/* Sale Details Card */}
            <div className="op-card w-full max-w-sm mb-6">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--op-gray-200)]">
                    <span className="text-sm text-[var(--op-gray-500)]">Sale #{saleId?.slice(-6).toUpperCase()}</span>
                    <span className="text-sm text-[var(--op-gray-500)]">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className="space-y-3">
                    {/* Fuel Type */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: isPetrol ? 'var(--op-petrol)15' : 'var(--op-diesel)15',
                                    color: isPetrol ? 'var(--op-petrol)' : 'var(--op-diesel)'
                                }}
                            >
                                <Droplet className="w-4 h-4" fill="currentColor" />
                            </div>
                            <span className="text-sm">Fuel Type</span>
                        </div>
                        <span className="font-semibold">{fuel}</span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--op-gray-500)]">Quantity</span>
                        <span className="font-semibold">{Number(liters).toFixed(2)} Liters</span>
                    </div>

                    {/* Payment */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--op-gray-500)]">Payment</span>
                        <span className="font-semibold">{payment}</span>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--op-gray-200)]">
                        <span className="font-medium">Total Amount</span>
                        <span
                            className="text-2xl font-bold"
                            style={{ color: isPetrol ? 'var(--op-petrol)' : 'var(--op-diesel)' }}
                        >
                            Rs {Number(amount).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Real-time Updates */}
            <div className="w-full max-w-sm mb-6">
                <div className="op-card bg-[var(--op-gray-50)]">
                    <p className="text-xs font-medium text-[var(--op-gray-500)] mb-2">Real-time Updates</p>
                    <div className="space-y-1.5">
                        {[
                            '✅ Admin notified',
                            '✅ Tank level updated',
                            '✅ Shift stats updated',
                        ].map((item, i) => (
                            <p key={i} className="text-sm text-[var(--op-success)] op-animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                                {item}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-sm space-y-3">
                {/* Send Receipt - Optional */}
                <button className="op-btn op-btn-ghost w-full">
                    <MessageCircle className="w-4 h-4" />
                    Send Receipt (SMS/WhatsApp)
                </button>

                {/* New Sale */}
                <button
                    onClick={() => router.push('/operator/sale')}
                    className="op-btn op-btn-primary w-full"
                    style={{ height: 56 }}
                >
                    <Fuel className="w-5 h-5" />
                    New Sale
                </button>

                {/* Back to Dashboard */}
                <button
                    onClick={() => router.push('/operator')}
                    className="op-btn op-btn-ghost w-full"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
            </div>

            {/* Auto-redirect */}
            <p className="text-xs text-[var(--op-gray-400)] mt-6">
                Returning to dashboard in {countdown} seconds...
            </p>
        </div>
    );
}
