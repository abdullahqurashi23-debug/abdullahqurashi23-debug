'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useSocket, useSocketEvent } from '@/lib/socket';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle,
    Clock,
    Filter,
    Search,
    Trash2,
    Eye,
    EyeOff,
    Droplet,
    Banknote,
    Users,
    Settings
} from 'lucide-react';

interface Alert {
    id: string;
    type: 'LOW_FUEL' | 'CASH_VARIANCE' | 'CREDIT_OVERDUE' | 'SHIFT_ISSUE' | 'SYSTEM';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    message: string;
    createdAt: string;
    readAt: string | null;
    resolvedAt: string | null;
    relatedId?: string;
}

export default function AdminAlertsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { connect, isConnected } = useSocket();
    const { showToast } = useToast();

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        connect(user.id, user.role, user.username);
        loadAlerts();
    }, [isAuthenticated, user, router, connect]);

    // Real-time alert updates
    useSocketEvent('alert:new', (alert: Alert) => {
        setAlerts(prev => [alert, ...prev]);
        showToast(`New Alert: ${alert.title}`, alert.severity === 'CRITICAL' ? 'error' : 'warning');
    });

    const loadAlerts = async () => {
        try {
            // Alerts will be empty initially - system will generate alerts based on actual conditions
            // In production, this would fetch from API
            setAlerts([]);
        } catch (error) {
            console.error('Failed to load alerts:', error);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = (id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, readAt: new Date().toISOString() } : a
        ));
    };

    const handleMarkAsResolved = (id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, resolvedAt: new Date().toISOString(), readAt: a.readAt || new Date().toISOString() } : a
        ));
        showToast('Alert resolved', 'success');
    };

    const handleDeleteAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        showToast('Alert deleted', 'success');
    };

    const handleMarkAllRead = () => {
        setAlerts(prev => prev.map(a => ({ ...a, readAt: a.readAt || new Date().toISOString() })));
        showToast('All alerts marked as read', 'success');
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch =
            alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.message.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'UNREAD') return !alert.readAt && matchesSearch;
        if (filter === 'CRITICAL') return alert.severity === 'CRITICAL' && matchesSearch;
        return matchesSearch;
    });

    const unreadCount = alerts.filter(a => !a.readAt).length;
    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolvedAt).length;

    const getSeverityStyles = (severity: Alert['severity']) => {
        switch (severity) {
            case 'CRITICAL':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    icon: 'text-red-500',
                    badge: 'danger' as const,
                };
            case 'WARNING':
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    icon: 'text-amber-500',
                    badge: 'warning' as const,
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    icon: 'text-blue-500',
                    badge: 'info' as const,
                };
        }
    };

    const getTypeIcon = (type: Alert['type']) => {
        switch (type) {
            case 'LOW_FUEL':
                return <Droplet className="w-5 h-5" />;
            case 'CASH_VARIANCE':
                return <Banknote className="w-5 h-5" />;
            case 'CREDIT_OVERDUE':
                return <AlertCircle className="w-5 h-5" />;
            case 'SHIFT_ISSUE':
                return <Users className="w-5 h-5" />;
            default:
                return <Settings className="w-5 h-5" />;
        }
    };

    const getSeverityIcon = (severity: Alert['severity']) => {
        switch (severity) {
            case 'CRITICAL':
                return <AlertTriangle className="w-5 h-5" />;
            case 'WARNING':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Bell className="w-6 h-6" />
                        Alerts & Notifications
                    </h1>
                    <p className="text-xs md:text-sm text-[var(--text-secondary)]">
                        Monitor system alerts and issues
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            onClick={handleMarkAllRead}
                            className="text-xs"
                        >
                            Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{alerts.length}</p>
                            <p className="text-xs text-[var(--text-secondary)]">Total Alerts</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <EyeOff className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{unreadCount}</p>
                            <p className="text-xs text-[var(--text-secondary)]">Unread</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{criticalCount}</p>
                            <p className="text-xs text-[var(--text-secondary)]">Critical</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {alerts.filter(a => a.resolvedAt).length}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">Resolved</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['ALL', 'UNREAD', 'CRITICAL'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                    }`}
                            >
                                {f === 'ALL' ? 'All' : f === 'UNREAD' ? `Unread (${unreadCount})` : `Critical (${criticalCount})`}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Alerts List */}
            <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                    <Card className="p-8 text-center">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                        <p className="text-[var(--text-primary)] font-medium">All Clear!</p>
                        <p className="text-sm text-[var(--text-secondary)]">No alerts to display</p>
                    </Card>
                ) : (
                    filteredAlerts.map((alert) => {
                        const styles = getSeverityStyles(alert.severity);
                        const isUnread = !alert.readAt;
                        const isResolved = !!alert.resolvedAt;

                        return (
                            <Card
                                key={alert.id}
                                className={`p-4 border-l-4 ${styles.border} ${isUnread ? styles.bg : ''} ${isResolved ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${styles.bg} ${styles.icon}`}>
                                        {getTypeIcon(alert.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className={`font-semibold ${isUnread ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                {alert.title}
                                            </h3>
                                            <Badge variant={styles.badge}>
                                                {alert.severity}
                                            </Badge>
                                            {isUnread && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            )}
                                            {isResolved && (
                                                <Badge variant="success">Resolved</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                                            {alert.message}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </span>
                                            <span className="capitalize">{alert.type.replace('_', ' ').toLowerCase()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isUnread && (
                                            <button
                                                onClick={() => handleMarkAsRead(alert.id)}
                                                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                                            </button>
                                        )}
                                        {!isResolved && (
                                            <button
                                                onClick={() => handleMarkAsResolved(alert.id)}
                                                className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                                title="Mark as resolved"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteAlert(alert.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
