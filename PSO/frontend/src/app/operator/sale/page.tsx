'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { ArrowLeft, Droplet, Banknote, CreditCard, Smartphone, Car, Check, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import { addPendingSale, cacheData, getCachedData } from '@/lib/offline-store';

interface FuelPrices {
    PETROL: number;
    DIESEL: number;
}

interface TankData {
    fuelType: string;
    currentLevel: number;
    capacity: number;
    percentageFull: number;
    pricePerLiter: number;
}

export default function NewSalePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { isOnline } = useOnlineStatus();

    const [tanks, setTanks] = useState<TankData[]>([]);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [savedOffline, setSavedOffline] = useState(false);

    // Form state
    const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL'>('PETROL');
    const [inputMode, setInputMode] = useState<'amount' | 'liters'>('amount');
    const [inputValue, setInputValue] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'JAZZCASH' | 'EASYPAISA'>('CASH');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [isCredit, setIsCredit] = useState(false);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [tankData, shiftData] = await Promise.all([
                    api.getTankStats().catch(() => []),
                    api.getActiveShift().catch(() => null),
                ]);
                if (tankData) setTanks(tankData);
                setActiveShift(shiftData);

                if (!shiftData) {
                    router.push('/operator/shift-start');
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [router]);

    // Get current tank and price
    const currentTank = tanks.find(t => t.fuelType === fuelType);
    const currentPrice = currentTank?.pricePerLiter || (fuelType === 'PETROL' ? 290 : 294);

    // Calculate values
    const calculatedLiters = inputMode === 'amount'
        ? (parseFloat(inputValue) / currentPrice) || 0
        : parseFloat(inputValue) || 0;
    const calculatedAmount = inputMode === 'liters'
        ? (parseFloat(inputValue) * currentPrice) || 0
        : parseFloat(inputValue) || 0;

    const displayLiters = inputMode === 'liters' ? inputValue : calculatedLiters.toFixed(2);
    const displayAmount = inputMode === 'amount' ? inputValue : calculatedAmount.toFixed(0);

    // Quick amounts
    const quickAmounts = [500, 1000, 2000, 3000, 5000];

    // Handle sale submission
    const handleSubmit = async () => {
        if (!inputValue || !activeShift || submitting) return;
        setSubmitting(true);
        setSavedOffline(false);

        const liters = inputMode === 'liters'
            ? parseFloat(inputValue)
            : parseFloat(inputValue) / currentPrice;

        const amount = inputMode === 'amount'
            ? parseFloat(inputValue)
            : parseFloat(inputValue) * currentPrice;

        const saleData = {
            fuelType,
            liters,
            paymentMethod: isCredit ? 'CREDIT' : paymentMethod,
            shiftId: activeShift.id,
            vehicleNumber: vehicleNumber || undefined,
        };

        try {
            // Try to send to server first
            const result = await api.recordSale(saleData);

            // Success - navigate to confirmation
            router.push(`/operator/sale/confirmation?saleId=${result.id}&amount=${result.totalAmount}&liters=${result.liters}&fuel=${fuelType}&payment=${paymentMethod}`);
        } catch (error: any) {
            // If offline or network error, save locally
            if (!isOnline || error.message?.includes('fetch') || error.message?.includes('network')) {
                try {
                    await addPendingSale({
                        fuelType,
                        liters,
                        totalAmount: amount,
                        paymentMethod: isCredit ? 'CREDIT' : paymentMethod,
                        shiftId: activeShift.id,
                        vehicleNumber: vehicleNumber || undefined,
                        timestamp: new Date().toISOString(),
                    });

                    // Show offline success
                    setSavedOffline(true);

                    // Reset form after delay
                    setTimeout(() => {
                        setInputValue('');
                        setVehicleNumber('');
                        setSavedOffline(false);
                    }, 3000);
                } catch (offlineError) {
                    alert('Failed to save sale offline. Please try again.');
                }
            } else {
                // Server error - show message
                alert(error.message || 'Failed to record sale');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="op-spinner"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-32 pt-4 px-4 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 max-w-lg mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">New Sale</h1>
                </div>

                {/* Fuel Type Selector - Clean Card Style */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Petrol Card */}
                    <button
                        type="button"
                        onClick={() => setFuelType('PETROL')}
                        className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group ${fuelType === 'PETROL'
                            ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 scale-[1.02] ring-2 ring-orange-500 ring-offset-2'
                            : 'bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:bg-white hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${fuelType === 'PETROL' ? 'bg-white/20' : 'bg-orange-50 text-orange-500'
                                }`}>
                                <Droplet className="w-6 h-6" fill={fuelType === 'PETROL' ? 'currentColor' : 'none'} />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold tracking-widest text-sm mb-1">PETROL</span>
                                <span className={`text-xs font-mono px-2 py-1 rounded-lg ${fuelType === 'PETROL' ? 'bg-black/10' : 'bg-slate-100'
                                    }`}>
                                    Rs {tanks.find(t => t.fuelType === 'PETROL')?.pricePerLiter || 290}
                                </span>
                            </div>
                        </div>
                    </button>

                    {/* Diesel Card */}
                    <button
                        type="button"
                        onClick={() => setFuelType('DIESEL')}
                        className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group ${fuelType === 'DIESEL'
                            ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20 scale-[1.02] ring-2 ring-teal-600 ring-offset-2'
                            : 'bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:bg-white hover:border-teal-200 hover:shadow-lg hover:shadow-teal-600/5'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${fuelType === 'DIESEL' ? 'bg-white/20' : 'bg-teal-50 text-teal-600'
                                }`}>
                                <Droplet className="w-6 h-6" fill={fuelType === 'DIESEL' ? 'currentColor' : 'none'} />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold tracking-widest text-sm mb-1">DIESEL</span>
                                <span className={`text-xs font-mono px-2 py-1 rounded-lg ${fuelType === 'DIESEL' ? 'bg-black/10' : 'bg-slate-100'
                                    }`}>
                                    Rs {tanks.find(t => t.fuelType === 'DIESEL')?.pricePerLiter || 294}
                                </span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Amount/Liters Input - Login Input Style Enlarged */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 p-6 transition-all duration-300 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent">
                    <div className="flex justify-between items-center mb-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {inputMode === 'amount' ? 'Enter Amount' : 'Enter Volume'}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setInputMode(inputMode === 'amount' ? 'liters' : 'amount');
                                setInputValue('');
                            }}
                            className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full uppercase tracking-wide transition-colors"
                        >
                            Swap to {inputMode === 'amount' ? 'Liters' : 'Rupees'}
                        </button>
                    </div>

                    {/* Main Input */}
                    <div className="relative mb-8">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 font-medium text-4xl select-none">
                            {inputMode === 'amount' ? 'Rs' : ''}
                        </span>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="0"
                            className="w-full text-center text-7xl font-bold bg-transparent border-b-2 border-slate-100 focus:border-slate-900 focus:outline-none transition-all py-2 text-slate-900 placeholder:text-slate-200"
                            autoFocus
                        />
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-medium text-2xl select-none">
                            {inputMode === 'liters' ? 'L' : ''}
                        </span>
                    </div>

                    {/* Quick Amounts - Login Role Toggle Style */}
                    {inputMode === 'amount' && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {quickAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => setInputValue(amount.toString())}
                                    className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${inputValue === amount.toString()
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    {amount >= 1000 ? `${amount / 1000}K` : amount}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Auto-calculation display */}
                    <div className="mt-6 text-center">
                        <div className="inline-block px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-sm font-medium text-slate-500">
                                {inputMode === 'amount' ? (
                                    <>≈ <span className="font-bold text-slate-900">{displayLiters} Liters</span></>
                                ) : (
                                    <>≈ <span className="font-bold text-slate-900">Rs {Number(displayAmount).toLocaleString()}</span></>
                                )}
                                <span className="text-xs text-slate-400 ml-2">@ {currentPrice}/L</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Method - Clean Grid */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Payment Method</p>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'CASH', label: 'Cash', icon: Banknote },
                            { id: 'CARD', label: 'Card', icon: CreditCard },
                            { id: 'JAZZCASH', label: 'Jazz', icon: Smartphone },
                            { id: 'EASYPAISA', label: 'Easy', icon: Smartphone },
                        ].map((method) => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.id;
                            return (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.id as any)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${isSelected
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10 scale-[1.02]'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mb-1.5" strokeWidth={2} />
                                    <span className="text-[10px] font-bold tracking-wide">{method.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Credit Sale Toggle & Vehicle Input */}
                    <div className="bg-white/50 border border-slate-200 rounded-2xl p-1">
                        <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${isCredit
                                ? 'bg-slate-900 border-slate-900 shadow-sm'
                                : 'bg-white border-slate-300'
                                }`}>
                                {isCredit && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                            </div>
                            <input
                                type="checkbox"
                                checked={isCredit}
                                onChange={(e) => setIsCredit(e.target.checked)}
                                className="hidden"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">Mark as Credit Sale</p>
                            </div>
                        </label>

                        {/* Inline Vehicle Input for seamlessness */}
                        <div className="px-3 pb-3 pt-1">
                            <div className="relative">
                                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={vehicleNumber}
                                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                    placeholder="Vehicle Number (Optional)"
                                    className={`w-full h-10 pl-10 pr-3 bg-slate-50 border rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all ${isCredit
                                        ? 'border-slate-300 focus:border-slate-900'
                                        : 'border-transparent bg-transparent'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Action Bar - Floating above Nav */}
            <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center pointer-events-none px-4">
                <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 p-2 rounded-3xl pointer-events-auto shadow-2xl shadow-slate-200/50">
                    {savedOffline ? (
                        // Offline success message
                        <div className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 animate-in zoom-in duration-300">
                            <WifiOff className="w-5 h-5" />
                            <span>Saved Offline! Will sync later</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!inputValue || submitting}
                            className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-lg tracking-wide hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 disabled:shadow-none group"
                        >
                            {submitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {!isOnline && <WifiOff className="w-5 h-5 text-amber-300" />}
                                    <Check className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={3} />
                                    <span>{isOnline ? 'RECORD SALE' : 'SAVE OFFLINE'}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

}
