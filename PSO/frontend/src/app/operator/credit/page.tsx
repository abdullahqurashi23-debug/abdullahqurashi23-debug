'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, CreditCard, Search, User, Phone, Clock } from 'lucide-react';

interface CreditCustomer {
    id: string;
    name: string;
    phone?: string;
    creditLimit: number;
    currentBalance: number;
}

export default function CreditSalesPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<CreditCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const data = await api.getCreditCustomers();
            setCustomers(data || []);
        } catch (error) {
            console.error('Failed to load credit customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    );

    return (
        <div className="relative min-h-screen pb-32 pt-4 px-4 font-sans text-slate-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Credit Sales</h1>
                        <p className="text-xs text-slate-500 font-medium">{customers.length} customers registered</p>
                    </div>
                </div>

                {/* Search - Glass Style */}
                <div className="relative mb-6 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search customers..."
                        className="w-full h-14 pl-12 pr-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 rotate-6 shadow-sm">
                            <CreditCard className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-900 text-lg">No customers found</p>
                        <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                            {searchQuery ? 'Try a different search term or check spelling' : 'No credit customers have been registered yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCustomers.map((customer) => (
                            <div
                                key={customer.id}
                                className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg leading-tight">{customer.name}</p>
                                            {customer.phone && (
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-red-50 text-red-600 px-2 py-1 rounded-lg border border-red-100 inline-block mb-1">
                                            <p className="font-bold text-sm tracking-tight">
                                                Rs {customer.currentBalance.toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                            Limit: {customer.creditLimit.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 h-10 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-black active:scale-95 transition-all"
                                        onClick={() => router.push(`/operator/sale?credit=true&customerId=${customer.id}`)}
                                    >
                                        Record Sale
                                    </button>
                                    <button
                                        className="h-10 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                                    >
                                        History
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
