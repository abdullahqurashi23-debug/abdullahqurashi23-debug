'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiMail, FiClock, FiUser, FiFileText, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

interface AccessRequest {
    id: string;
    name: string;
    email: string;
    company: string | null;
    role: string | null;
    reason: string;
    project_id: string | null;
    project_title: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string | null;
}

export default function AccessRequestsPage() {
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('access_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setRequests(data);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/admin/approve-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: id,
                    action: status === 'approved' ? 'approve' : 'reject'
                })
            });

            const data = await res.json();

            if (res.ok) {
                setRequests(requests.map(r =>
                    r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r
                ));
            } else {
                console.error('Failed to update status:', data.error);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteRequest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this request?')) return;

        const { error } = await supabase
            .from('access_requests')
            .delete()
            .eq('id', id);

        if (!error) {
            setRequests(requests.filter(r => r.id !== id));
        }
    };

    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(r => r.status === filter);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">Pending</span>;
            case 'approved':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Approved</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">Rejected</span>;
            default:
                return null;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const stats = {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Access Requests</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage requests for gated content access</p>
                </div>
                <Button onClick={fetchRequests} variant="secondary" className="flex items-center gap-2">
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.approved}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.rejected}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === tab
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab !== 'all' && (
                            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                                {tab === 'pending' ? stats.pending : tab === 'approved' ? stats.approved : stats.rejected}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
                <Card>
                    <div className="text-center py-12 text-gray-500">
                        <FiFileText className="mx-auto text-4xl mb-4 opacity-50" />
                        <p>No {filter !== 'all' ? filter : ''} access requests found.</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(request => (
                        <Card key={request.id} className="relative">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <FiUser className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{request.name}</h3>
                                            <a href={`mailto:${request.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                                <FiMail size={12} /> {request.email}
                                            </a>
                                        </div>
                                        {getStatusBadge(request.status)}
                                    </div>

                                    {(request.company || request.role) && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {request.role}{request.role && request.company ? ' at ' : ''}{request.company}
                                        </p>
                                    )}

                                    {request.project_title && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <strong>Project:</strong> {request.project_title}
                                        </p>
                                    )}

                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{request.reason}</p>
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FiClock size={12} /> Requested {formatDate(request.created_at)}
                                        </span>
                                        {request.updated_at && request.status !== 'pending' && (
                                            <span>Updated {formatDate(request.updated_at)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 md:flex-col">
                                    {request.status === 'pending' ? (
                                        <>
                                            <Button
                                                onClick={() => updateStatus(request.id, 'approved')}
                                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                            >
                                                <FiCheck /> Approve
                                            </Button>
                                            <Button
                                                onClick={() => updateStatus(request.id, 'rejected')}
                                                variant="secondary"
                                                className="flex items-center gap-1"
                                            >
                                                <FiX /> Reject
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => deleteRequest(request.id)}
                                            variant="secondary"
                                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                        >
                                            <FiX /> Delete
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
