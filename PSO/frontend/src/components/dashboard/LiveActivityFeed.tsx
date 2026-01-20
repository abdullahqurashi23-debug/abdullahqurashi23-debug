'use client';

import { Card } from '@/components/ui/Card';
import { Sale } from '@/types/sales'; // Assuming type exists, if not use any for now
import { Droplet, CircleDollarSign } from 'lucide-react';

interface LiveActivityFeedProps {
    activities: any[]; // Replace with correct Sale type
}

export const LiveActivityFeed = ({ activities }: LiveActivityFeedProps) => {
    return (
        <Card title="Live Activity" className="h-full">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                        No recent activity
                    </div>
                ) : (
                    activities.map((activity, idx) => (
                        <div key={activity.id || idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors border border-transparent hover:border-[var(--border)] animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            {/* Avatar/Icon */}
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                ${activity.fuelType === 'PETROL' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}
                            `}>
                                <Droplet className="w-5 h-5 fill-current" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                    {activity.operatorName || 'Operator'}
                                </p>
                                <p className="text-xs text-[var(--text-secondary)] truncate">
                                    Sold {activity.liters}L {activity.fuelType}
                                </p>
                            </div>

                            {/* Amount & Time */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-[var(--text-primary)] font-mono">
                                    Rs {activity.amount?.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)]">
                                    {new Date(activity.timestamp || activity.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
