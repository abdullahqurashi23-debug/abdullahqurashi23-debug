'use client';

import { Card } from '@/components/ui/Card';
import { TrendingDown, AlertTriangle, CheckCircle, Fuel } from 'lucide-react';

interface TankPrediction {
    fuelType: string;
    currentLevel: number;
    capacity: number;
    avgDailyConsumption: number;
    daysUntilEmpty: number | null;
    daysUntilCritical: number | null;
    status: 'CRITICAL' | 'WARNING' | 'OK';
    message: string;
}

interface TankPredictionWidgetProps {
    predictions: TankPrediction[];
}

export const TankPredictionWidget = ({ predictions }: TankPredictionWidgetProps) => {
    if (!predictions || predictions.length === 0) {
        return (
            <Card title="Tank Predictions" className="h-full">
                <div className="text-center py-8 text-[var(--text-muted)]">
                    No prediction data available
                </div>
            </Card>
        );
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'CRITICAL':
                return 'bg-red-100 border-red-300 text-red-700';
            case 'WARNING':
                return 'bg-amber-100 border-amber-300 text-amber-700';
            default:
                return 'bg-emerald-100 border-emerald-300 text-emerald-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CRITICAL':
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'WARNING':
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default:
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        }
    };

    return (
        <Card title="Tank Predictions" className="h-full">
            <div className="space-y-4">
                {predictions.map((prediction) => (
                    <div
                        key={prediction.fuelType}
                        className={`p-4 rounded-xl border-2 ${getStatusStyles(prediction.status)} transition-all`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prediction.fuelType === 'PETROL'
                                        ? 'bg-orange-200 text-orange-600'
                                        : 'bg-teal-200 text-teal-600'
                                    }`}>
                                    <Fuel className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold">{prediction.fuelType}</p>
                                    <p className="text-xs opacity-75">
                                        {prediction.currentLevel.toLocaleString()}L / {prediction.capacity.toLocaleString()}L
                                    </p>
                                </div>
                            </div>
                            {getStatusIcon(prediction.status)}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Avg. {prediction.avgDailyConsumption.toLocaleString()}L/day
                            </span>
                        </div>

                        <p className="text-sm font-bold">
                            {prediction.message}
                        </p>

                        {prediction.daysUntilEmpty !== null && (
                            <div className="mt-3 flex items-center gap-4 text-xs">
                                <span className="bg-white/50 px-2 py-1 rounded-full">
                                    Empty in: <strong>{prediction.daysUntilEmpty} days</strong>
                                </span>
                                {prediction.daysUntilCritical !== null && (
                                    <span className="bg-white/50 px-2 py-1 rounded-full">
                                        Critical in: <strong>{prediction.daysUntilCritical} days</strong>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};
