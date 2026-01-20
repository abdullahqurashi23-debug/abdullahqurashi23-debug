'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
    AlertTriangle,
    Bell,
    CheckCircle,
    Info,
    X,
    Droplet,
    CreditCard,
    Clock
} from 'lucide-react';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    actionLabel?: string;
    actionHref?: string;
}

// Generate alerts based on tank levels only - no dummy data
const generateAlerts = (tanks: any[]): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();

    // Check tank levels
    tanks.forEach((tank) => {
        const percentage = (tank.currentLevel / tank.capacity) * 100;

        if (percentage < 15) {
            alerts.push({
                id: `tank-critical-${tank.fuelType}`,
                type: 'critical',
                title: `${tank.fuelType} Tank Critical`,
                message: `Only ${percentage.toFixed(0)}% remaining. Order fuel immediately!`,
                timestamp: now,
                isRead: false,
                actionLabel: 'Order Fuel',
                actionHref: '/admin/inventory/deliveries',
            });
        } else if (percentage < 30) {
            alerts.push({
                id: `tank-warning-${tank.fuelType}`,
                type: 'warning',
                title: `${tank.fuelType} Running Low`,
                message: `${percentage.toFixed(0)}% remaining. Refill recommended in 2-3 days.`,
                timestamp: now,
                isRead: false,
            });
        }
    });

    return alerts;
};

interface AlertsWidgetProps {
    tanks?: any[];
    maxAlerts?: number;
}

export const AlertsWidget = ({ tanks = [], maxAlerts = 5 }: AlertsWidgetProps) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const generatedAlerts = generateAlerts(tanks);
        setAlerts(generatedAlerts);
    }, [tanks]);

    const markAsRead = (id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, isRead: true } : a
        ));
    };

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const unreadCount = alerts.filter(a => !a.isRead).length;
    const displayedAlerts = showAll ? alerts : alerts.slice(0, maxAlerts);

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getAlertStyle = (type: string, isRead: boolean) => {
        const base = isRead ? 'opacity-60' : '';
        switch (type) {
            case 'critical':
                return `${base} border-l-4 border-red-500 bg-red-50`;
            case 'warning':
                return `${base} border-l-4 border-amber-500 bg-amber-50`;
            case 'info':
                return `${base} border-l-4 border-blue-500 bg-blue-50`;
            default:
                return base;
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Card className="h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[var(--text-primary)]" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Alerts</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {alerts.length > maxAlerts && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                        {showAll ? 'Show Less' : 'View All'}
                    </button>
                )}
            </div>

            {/* Alerts List */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {displayedAlerts.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-[var(--text-secondary)]">All clear! No alerts.</p>
                    </div>
                ) : (
                    displayedAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-3 rounded-lg transition-all hover:shadow-sm ${getAlertStyle(alert.type, alert.isRead)}`}
                            onClick={() => markAsRead(alert.id)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-sm font-semibold ${!alert.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {alert.title}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dismissAlert(alert.id);
                                            }}
                                            className="p-1 hover:bg-black/5 rounded"
                                        >
                                            <X className="w-3 h-3 text-gray-400" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] text-gray-400">
                                            {formatTimestamp(alert.timestamp)}
                                        </span>
                                        {alert.actionLabel && (
                                            <a
                                                href={alert.actionHref}
                                                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {alert.actionLabel} →
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {!alert.isRead && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Critical Alert Pulse Animation */}
            {alerts.some(a => a.type === 'critical' && !a.isRead) && (
                <div className="mt-4 p-3 bg-red-500 text-white rounded-lg animate-pulse-custom">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm font-bold">Action Required!</span>
                    </div>
                </div>
            )}
        </Card>
    );
};
