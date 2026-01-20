'use client';

import { Card } from '@/components/ui/Card';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface SalesChartProps {
    data: any[];
}

export const SalesChartWidget = ({ data }: SalesChartProps) => {
    return (
        <Card title="Sales Trend" className="h-full">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPetrol" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-petrol)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--color-petrol)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-diesel)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--color-diesel)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                            tickFormatter={(value) => `Rs ${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-3)'
                            }}
                        />
                        <Legend iconType="circle" />
                        <Area
                            type="monotone"
                            dataKey="petrolSales"
                            name="Petrol"
                            stroke="var(--color-petrol)"
                            fillOpacity={1}
                            fill="url(#colorPetrol)"
                            strokeWidth={3}
                        />
                        <Area
                            type="monotone"
                            dataKey="dieselSales"
                            name="Diesel"
                            stroke="var(--color-diesel)"
                            fillOpacity={1}
                            fill="url(#colorDiesel)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
