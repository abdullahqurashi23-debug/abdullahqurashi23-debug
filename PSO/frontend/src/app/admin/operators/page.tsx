'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { useSocketEvent } from '@/lib/socket';

interface Operator {
    id: string;
    username: string;
    fullName: string;
    phone: string | null;
    cnic: string | null;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
    lastLogin: string | null;
}

export default function OperatorsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [operators, setOperators] = useState<Operator[]>([]);
    const [onlineOperatorIds, setOnlineOperatorIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');

    // Create form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        phone: '',
        cnic: '',
    });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const loadOperators = useCallback(async () => {
        try {
            const data = await api.getOperators();
            setOperators(data);
        } catch (error) {
            console.error('Failed to load operators:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        loadOperators();
    }, [isAuthenticated, user, router, loadOperators]);

    // Real-time: Track which operators are currently online
    useSocketEvent('operators:active', (data: { count: number; operators: { userId: string; username: string }[] }) => {
        const ids = new Set(data.operators.map(op => op.userId));
        setOnlineOperatorIds(ids);
    });


    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await api.approveOperator(id);
            setOperators(ops => ops.map(op =>
                op.id === id ? { ...op, status: 'ACTIVE' as const } : op
            ));
        } catch (error: any) {
            alert(error.message || 'Failed to approve operator');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSuspend = async (id: string) => {
        setActionLoading(id);
        try {
            await api.suspendOperator(id);
            setOperators(ops => ops.map(op =>
                op.id === id ? { ...op, status: 'SUSPENDED' as const } : op
            ));
        } catch (error: any) {
            alert(error.message || 'Failed to suspend operator');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateOperator = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            await api.createOperator(formData);
            setShowCreateModal(false);
            setFormData({ username: '', password: '', fullName: '', phone: '', cnic: '' });
            loadOperators();
        } catch (error: any) {
            setFormError(error.message || 'Failed to create operator');
        } finally {
            setFormLoading(false);
        }
    };

    const filteredOperators = operators.filter(op => {
        if (filter === 'all') return true;
        return op.status === filter.toUpperCase();
    });

    const pendingCount = operators.filter(op => op.status === 'PENDING').length;
    const activeCount = operators.filter(op => op.status === 'ACTIVE').length;
    const suspendedCount = operators.filter(op => op.status === 'SUSPENDED').length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            case 'PENDING': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
            case 'SUSPENDED': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

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
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Operator Management</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Manage system access and roles</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary w-full sm:w-auto justify-center"
                    >
                        <span>+</span> Add Operator
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`card-stat text-left relative overflow-hidden group ${filter === 'all' ? 'ring-2 ring-[var(--color-primary)]' : ''}`}
                    >
                        <div className="relative z-10">
                            <p className="text-[var(--text-secondary)] font-medium mb-1">Total Operators</p>
                            <p className="text-[var(--text-metric)] font-bold text-[var(--text-primary)]">{operators.length}</p>
                        </div>
                        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-blue-500/10 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={() => setFilter('pending')}
                        className={`card-stat text-left relative overflow-hidden group ${filter === 'pending' ? 'ring-2 ring-[var(--color-warning)]' : ''}`}
                    >
                        <div className="relative z-10">
                            <p className="text-[var(--text-secondary)] font-medium mb-1">Pending Approval</p>
                            <p className="text-[var(--text-metric)] font-bold text-[var(--color-warning)]">{pendingCount}</p>
                        </div>
                        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-amber-500/10 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={() => setFilter('active')}
                        className={`card-stat text-left relative overflow-hidden group ${filter === 'active' ? 'ring-2 ring-[var(--color-success)]' : ''}`}
                    >
                        <div className="relative z-10">
                            <p className="text-[var(--text-secondary)] font-medium mb-1">Active</p>
                            <p className="text-[var(--text-metric)] font-bold text-[var(--color-success)]">{activeCount}</p>
                        </div>
                        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-emerald-500/10 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={() => setFilter('suspended')}
                        className={`card-stat text-left relative overflow-hidden group ${filter === 'suspended' ? 'ring-2 ring-[var(--color-danger)]' : ''}`}
                    >
                        <div className="relative z-10">
                            <p className="text-[var(--text-secondary)] font-medium mb-1">Suspended</p>
                            <p className="text-[var(--text-metric)] font-bold text-[var(--color-danger)]">{suspendedCount}</p>
                        </div>
                        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-red-500/10 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Operators Table */}
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Operator</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)] bg-[var(--background)]">
                                {filteredOperators.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                                            No operators found matching criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOperators.map((operator) => (
                                        <tr key={operator.id} className="hover:bg-[var(--surface)] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                            {operator.fullName.charAt(0)}
                                                        </div>
                                                        {onlineOperatorIds.has(operator.id) && (
                                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="Online now" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[var(--text-primary)]">{operator.fullName}</p>
                                                        <p className="text-sm text-[var(--text-secondary)]">@{operator.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-[var(--text-primary)]">{operator.phone || '-'}</p>
                                                <p className="text-xs text-[var(--text-secondary)] font-mono">{operator.cnic || 'No CNIC'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${operator.status === 'ACTIVE' ? 'badge-success' :
                                                    operator.status === 'PENDING' ? 'badge-warning' :
                                                        'badge-danger'
                                                    }`}>
                                                    {operator.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                                {operator.lastLogin
                                                    ? new Date(operator.lastLogin).toLocaleString()
                                                    : 'Never'
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {operator.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleApprove(operator.id)}
                                                            disabled={actionLoading === operator.id}
                                                            className="btn btn-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                                        >
                                                            {actionLoading === operator.id ? '...' : 'Approve'}
                                                        </button>
                                                    )}
                                                    {operator.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => handleSuspend(operator.id)}
                                                            disabled={actionLoading === operator.id}
                                                            className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                                                        >
                                                            {actionLoading === operator.id ? '...' : 'Suspend'}
                                                        </button>
                                                    )}
                                                    {operator.status === 'SUSPENDED' && (
                                                        <button
                                                            onClick={() => handleApprove(operator.id)}
                                                            disabled={actionLoading === operator.id}
                                                            className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                                        >
                                                            {actionLoading === operator.id ? '...' : 'Reactivate'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Create Operator Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[var(--background)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[var(--border)] bg-[var(--surface)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Add New Operator</h2>
                            <p className="text-sm text-[var(--text-secondary)]">Create a new operator account</p>
                        </div>

                        <form onSubmit={handleCreateOperator} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Username *</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="03XX..."
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">CNIC</label>
                                    <input
                                        type="text"
                                        value={formData.cnic}
                                        onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                                        placeholder="42101..."
                                        className="input"
                                    />
                                </div>
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
                                    disabled={formLoading}
                                    className="btn btn-primary flex-1"
                                >
                                    {formLoading ? 'Creating...' : 'Create Operator'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
