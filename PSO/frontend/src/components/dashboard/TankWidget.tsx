'use client';

import { Card } from '@/components/ui/Card';
import { TankStats } from '@/types/dashboard';

interface TankWidgetProps {
    data: TankStats[];
}

export const TankWidget = ({ data }: TankWidgetProps) => {
    return (
        <Card title="Tank Levels" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.map((tank) => (
                    <div key={tank.fuelType} className="flex flex-col items-center">
                        <div className="flex items-center justify-between w-full mb-2">
                            <span className="font-bold text-[var(--text-primary)]">{tank.fuelType}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tank.isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {tank.isLow ? 'Low Stock' : 'Healthy'}
                            </span>
                        </div>

                        {/* Tank Visual container */}
                        <div className="relative w-32 h-48 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-inner mb-4">
                            {/* Liquid */}
                            <div
                                className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out
                                    ${tank.fuelType === 'PETROL' ? 'bg-gradient-to-t from-[var(--color-petrol)] to-[var(--color-petrol-light)]' : 'bg-gradient-to-t from-[var(--color-diesel)] to-[var(--color-diesel-light)]'}
                                `}
                                style={{ height: `${tank.percentageFull}%` }}
                            >
                                {/* Wave Animation Overlay */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 animate-wave"></div>
                            </div>

                            {/* Glass Reflection */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none"></div>

                            {/* Percentage Label */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white drop-shadow-md">
                                    {Math.round(tank.percentageFull)}%
                                </span>
                            </div>
                        </div>

                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Current</span>
                                <span className="font-mono font-medium">{tank.currentLevel.toLocaleString()} L</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Capacity</span>
                                <span className="font-mono font-medium">{tank.capacity.toLocaleString()} L</span>
                            </div>

                            {/* Simple progress bar backup */}
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${tank.fuelType === 'PETROL' ? 'bg-[var(--color-petrol)]' : 'bg-[var(--color-diesel)]'}`}
                                    style={{ width: `${tank.percentageFull}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
