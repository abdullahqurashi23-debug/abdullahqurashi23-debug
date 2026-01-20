'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';

interface CashFlow {
    cashFromSales: number;
    deposited: number;
    expenses: number;
    cashInHand: number;
}

interface MonthlySummary {
    totalSales: number;
    totalDeposits: number;
    totalExpenses: number;
    fuelPurchases: number;
    profit: number;
}

export default function BankingPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [cashFlow, setCashFlow] = useState<CashFlow | null>(null);
    const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<any[]>([]);

    // Modal states
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [depositData, setDepositData] = useState({ amount: '', bankName: '', reference: '' });
    const [expenseData, setExpenseData] = useState({ amount: '', category: 'UTILITIES', description: '', vendor: '' });
    const [modalLoading, setModalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'expenses'>('overview');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        loadData();
    }, [isAuthenticated, user, router]);

    const loadData = async () => {
        try {
            const [flow, summary, trans, exp, cats] = await Promise.all([
                api.getCashFlow(),
                api.getMonthlySummary(),
                api.getTransactions(20),
                api.getExpenses(20),
                api.getExpensesByCategory(),
            ]);
            setCashFlow(flow);
            setMonthlySummary(summary);
            setTransactions(trans);
            setExpenses(exp);
            setExpenseCategories(cats);
        } catch (error) {
            console.error('Failed to load banking data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            await api.recordDeposit({
                amount: parseFloat(depositData.amount),
                bankName: depositData.bankName || undefined,
                reference: depositData.reference || undefined,
            });
            setShowDepositModal(false);
            setDepositData({ amount: '', bankName: '', reference: '' });
            loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to record deposit');
        } finally {
            setModalLoading(false);
        }
    };

    const handleExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            await api.recordExpense({
                amount: parseFloat(expenseData.amount),
                category: expenseData.category,
                description: expenseData.description || undefined,
                vendor: expenseData.vendor || undefined,
            });
            setShowExpenseModal(false);
            setExpenseData({ amount: '', category: 'UTILITIES', description: '', vendor: '' });
            loadData();
        } catch (error: any) {
            alert(error.message || 'Failed to record expense');
        } finally {
            setModalLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `Rs ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
    };

    const expenseCategories_list = [
        'UTILITIES', 'SALARY', 'MAINTENANCE', 'SUPPLIES', 'RENT', 'TAXES', 'TRANSPORT', 'OTHER'
    ];

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
            <header className="bg-[var(--background)] border-b border-[var(--border)] sticky top-[var(--header-height)] z-30 transition-all">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Banking & Finance</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Manage cash flow, deposits & expenses</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setShowDepositModal(true)}
                            className="btn btn-primary bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:brightness-110 border-none flex-1 sm:flex-none justify-center"
                        >
                            + Deposit
                        </button>
                        <button
                            onClick={() => setShowExpenseModal(true)}
                            className="btn btn-danger flex-1 sm:flex-none justify-center"
                        >
                            + Expense
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
                {/* Cash Flow Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                    <div className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm transition-all bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <p className="text-blue-100 text-xs md:text-sm font-medium mb-1">Cash from Sales</p>
                        <p className="text-lg md:text-2xl font-bold">{formatCurrency(cashFlow?.cashFromSales || 0)}</p>
                    </div>
                    <div className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm transition-all bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                        <p className="text-emerald-100 text-xs md:text-sm font-medium mb-1">Deposited</p>
                        <p className="text-lg md:text-2xl font-bold">{formatCurrency(cashFlow?.deposited || 0)}</p>
                    </div>
                    <div className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm transition-all bg-gradient-to-br from-red-500 to-red-600 text-white">
                        <p className="text-red-100 text-xs md:text-sm font-medium mb-1">Expenses</p>
                        <p className="text-lg md:text-2xl font-bold">{formatCurrency(cashFlow?.expenses || 0)}</p>
                    </div>
                    <div className="rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm transition-all bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                        <p className="text-amber-100 text-xs md:text-sm font-medium mb-1">Cash in Hand</p>
                        <p className="text-lg md:text-2xl font-bold">{formatCurrency(cashFlow?.cashInHand || 0)}</p>
                    </div>
                </div>

                {/* Monthly Summary Card */}
                <div className="card mb-6 md:mb-8 p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
                        📊 This Month's Summary
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
                        <div className="text-center p-3 md:p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                            <p className="text-lg md:text-xl font-bold text-[var(--color-primary)]">{formatCurrency(monthlySummary?.totalSales || 0)}</p>
                            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">Total Sales</p>
                        </div>
                        <div className="text-center p-3 md:p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                            <p className="text-lg md:text-xl font-bold text-[var(--color-secondary)]">{formatCurrency(monthlySummary?.totalDeposits || 0)}</p>
                            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">Deposits</p>
                        </div>
                        <div className="text-center p-3 md:p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                            <p className="text-lg md:text-xl font-bold text-purple-600">{formatCurrency(monthlySummary?.fuelPurchases || 0)}</p>
                            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">Fuel Purchases</p>
                        </div>
                        <div className="text-center p-3 md:p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                            <p className="text-lg md:text-xl font-bold text-[var(--color-danger)]">{formatCurrency(monthlySummary?.totalExpenses || 0)}</p>
                            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">Expenses</p>
                        </div>
                        <div className="text-center p-3 md:p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] col-span-2 lg:col-span-1">
                            <p className={`text-lg md:text-xl font-bold ${(monthlySummary?.profit || 0) >= 0 ? 'text-[var(--color-secondary)]' : 'text-[var(--color-danger)]'}`}>
                                {formatCurrency(monthlySummary?.profit || 0)}
                            </p>
                            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">Profit</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-[var(--border)] overflow-x-auto pb-1 mobile-scroll">
                    {(['overview', 'transactions', 'expenses'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 md:px-6 py-2 md:py-3 font-medium capitalize transition-colors border-b-2 whitespace-nowrap text-sm md:text-base ${activeTab === tab
                                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expense by Category */}
                        <div className="card">
                            <h3 className="text-[var(--text-h4)] font-semibold mb-4">Expenses by Category</h3>
                            <div className="space-y-3">
                                {expenseCategories.length === 0 ? (
                                    <p className="text-[var(--text-secondary)] text-center py-8">No expenses this month</p>
                                ) : (
                                    expenseCategories.map((cat) => (
                                        <div key={cat.category} className="flex items-center justify-between p-3 bg-[var(--surface)] rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">
                                                    {cat.category.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium">{cat.category}</span>
                                            </div>
                                            <span className="font-bold text-[var(--text-primary)]">{formatCurrency(cat.total)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="card">
                            <h3 className="text-[var(--text-h4)] font-semibold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    href="/admin/customers"
                                    className="p-6 bg-[var(--surface)] hover:bg-gray-100 rounded-xl text-center transition-colors border border-[var(--border)] group"
                                >
                                    <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">👥</span>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Credit Customers</span>
                                </Link>
                                <button
                                    onClick={() => setShowDepositModal(true)}
                                    className="p-6 bg-[var(--surface)] hover:bg-gray-100 rounded-xl text-center transition-colors border border-[var(--border)] group"
                                >
                                    <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">🏦</span>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">New Deposit</span>
                                </button>
                                <button
                                    onClick={() => setShowExpenseModal(true)}
                                    className="p-6 bg-[var(--surface)] hover:bg-gray-100 rounded-xl text-center transition-colors border border-[var(--border)] group"
                                >
                                    <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">💸</span>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Record Expense</span>
                                </button>
                                <Link
                                    href="/admin/reports"
                                    className="p-6 bg-[var(--surface)] hover:bg-gray-100 rounded-xl text-center transition-colors border border-[var(--border)] group"
                                >
                                    <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">📊</span>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">View Reports</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="card overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase">Bank</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase">Reference</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text-secondary)] uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                                                No transactions recorded
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-[var(--surface)] transition-colors">
                                                <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                                                    {new Date(tx.transactionDate).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="badge badge-success bg-emerald-50 text-emerald-700 border-none">
                                                        {tx.transactionType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[var(--text-primary)]">{tx.bankName || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{tx.reference || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-right font-bold text-[var(--color-secondary)]">
                                                    {formatCurrency(Number(tx.amount))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="card overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase">Description</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase">Vendor</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text-secondary)] uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                                                No expenses recorded
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map((exp) => (
                                            <tr key={exp.id} className="hover:bg-[var(--surface)] transition-colors">
                                                <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                                                    {new Date(exp.expenseDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="badge badge-danger bg-red-50 text-red-700 border-none">
                                                        {exp.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[var(--text-primary)]">{exp.description || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{exp.vendor || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-right font-bold text-[var(--color-danger)]">
                                                    {formatCurrency(Number(exp.amount))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[var(--background)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border)] animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[var(--border)] bg-[var(--surface)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Record Bank Deposit</h2>
                        </div>
                        <form onSubmit={handleDeposit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount *</label>
                                <input
                                    type="number"
                                    value={depositData.amount}
                                    onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                                    className="input input-numeric"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={depositData.bankName}
                                    onChange={(e) => setDepositData({ ...depositData, bankName: e.target.value })}
                                    placeholder="HBL, MCB, UBL..."
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reference / Slip #</label>
                                <input
                                    type="text"
                                    value={depositData.reference}
                                    onChange={(e) => setDepositData({ ...depositData, reference: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDepositModal(false)}
                                    className="btn btn-ghost flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="btn btn-primary bg-[var(--color-secondary)] hover:bg-emerald-600 border-none flex-1"
                                >
                                    {modalLoading ? 'Recording...' : 'Record Deposit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[var(--background)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border)] animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[var(--border)] bg-[var(--surface)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Record Expense</h2>
                        </div>
                        <form onSubmit={handleExpense} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount *</label>
                                <input
                                    type="number"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                                    className="input input-numeric"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category *</label>
                                <select
                                    value={expenseData.category}
                                    onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                                    className="input"
                                >
                                    {expenseCategories_list.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                                <input
                                    type="text"
                                    value={expenseData.description}
                                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Vendor / Paid To</label>
                                <input
                                    type="text"
                                    value={expenseData.vendor}
                                    onChange={(e) => setExpenseData({ ...expenseData, vendor: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseModal(false)}
                                    className="btn btn-ghost flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="btn btn-danger flex-1"
                                >
                                    {modalLoading ? 'Recording...' : 'Record Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
