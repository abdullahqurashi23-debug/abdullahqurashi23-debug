'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';

interface CreditCustomer {
    id: string;
    name: string;
    phone: string | null;
    cnic: string | null;
    creditLimit: number;
    currentBalance: number;
    status: string;
    lastPaymentDate: string | null;
    createdAt: string;
}

export default function CustomersPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<CreditCustomer[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomer | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cnic: '',
        address: '',
        creditLimit: '',
    });

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        loadCustomers();
    }, [isAuthenticated, user, router]);

    const loadCustomers = async () => {
        try {
            const data = await api.getCreditCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            await api.createCreditCustomer({
                name: formData.name,
                phone: formData.phone || undefined,
                creditLimit: parseFloat(formData.creditLimit),
            });
            setShowCreateModal(false);
            setFormData({ name: '', phone: '', cnic: '', address: '', creditLimit: '' });
            loadCustomers();
        } catch (error: any) {
            alert(error.message || 'Failed to create customer');
        } finally {
            setModalLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        setModalLoading(true);
        try {
            await api.receiveCreditPayment(selectedCustomer.id, parseFloat(paymentAmount));
            setShowPaymentModal(false);
            setPaymentAmount('');
            setSelectedCustomer(null);
            loadCustomers();
        } catch (error: any) {
            alert(error.message || 'Failed to record payment');
        } finally {
            setModalLoading(false);
        }
    };

    const openPaymentModal = (customer: CreditCustomer) => {
        setSelectedCustomer(customer);
        setPaymentAmount('');
        setShowPaymentModal(true);
    };

    const formatCurrency = (amount: number) => {
        return `Rs ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
    };

    const totalOutstanding = customers.reduce((sum, c) => sum + Number(c.currentBalance), 0);
    const activeCustomers = customers.filter(c => Number(c.currentBalance) > 0).length;

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
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-[var(--text-h2)] font-bold text-[var(--text-primary)]">Credit Customers</h1>
                        <p className="text-[var(--text-secondary)]">{customers.length} customers</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <span>+</span> Add Customer
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Customers</p>
                            <p className="text-3xl font-bold text-[var(--text-primary)]">{customers.length}</p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-50 to-transparent opacity-50 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="card p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Active Balances</p>
                            <p className="text-3xl font-bold text-[var(--text-primary)]">{activeCustomers}</p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-amber-50 to-transparent opacity-50 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="card p-6 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Outstanding</p>
                            <p className="text-3xl font-bold text-[var(--color-primary)]">{formatCurrency(totalOutstanding)}</p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-red-50 to-transparent opacity-50 transition-transform group-hover:scale-110" />
                    </div>
                </div>

                {/* Customers List */}
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Credit Limit</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Balance</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Last Payment</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                                            No credit customers yet
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-[var(--background)] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[var(--color-primary)] font-bold text-lg border border-blue-100">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[var(--text-primary)]">{customer.name}</p>
                                                        <p className="text-sm text-[var(--text-secondary)]">{customer.cnic || 'No CNIC'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{customer.phone || '-'}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{formatCurrency(Number(customer.creditLimit))}</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${Number(customer.currentBalance) > 0 ? 'badge-warning' : 'badge-success'
                                                    }`}>
                                                    {formatCurrency(Number(customer.currentBalance))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                                {customer.lastPaymentDate
                                                    ? new Date(customer.lastPaymentDate).toLocaleDateString()
                                                    : 'Never'
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {Number(customer.currentBalance) > 0 && (
                                                    <button
                                                        onClick={() => openPaymentModal(customer)}
                                                        className="btn btn-sm btn-outline-success"
                                                    >
                                                        Receive Payment
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-[var(--border)]">
                            <h2 className="text-[var(--text-h3)] font-bold text-[var(--text-primary)]">Add Credit Customer</h2>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="03XX-XXXXXXX"
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Credit Limit *</label>
                                <input
                                    type="number"
                                    value={formData.creditLimit}
                                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                                    placeholder="50000"
                                    className="input w-full"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn btn-ghost flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="btn btn-primary flex-1"
                                >
                                    {modalLoading ? 'Creating...' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-[var(--border)]">
                            <h2 className="text-[var(--text-h3)] font-bold text-[var(--text-primary)]">Receive Payment</h2>
                            <p className="text-[var(--text-secondary)] text-sm mt-1">From: {selectedCustomer.name}</p>
                        </div>
                        <form onSubmit={handlePayment} className="p-6 space-y-4">
                            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[var(--text-secondary)]">Outstanding Balance:</span>
                                    <span className="font-bold text-[var(--color-primary)]">
                                        {formatCurrency(Number(selectedCustomer.currentBalance))}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-secondary)]">Credit Limit:</span>
                                    <span className="text-[var(--text-primary)]">{formatCurrency(Number(selectedCustomer.creditLimit))}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payment Amount *</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    max={Number(selectedCustomer.currentBalance)}
                                    className="input w-full"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="btn btn-ghost flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="btn btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700 border-none"
                                >
                                    {modalLoading ? 'Recording...' : 'Receive Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
