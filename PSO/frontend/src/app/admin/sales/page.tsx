'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { useSocketEvent } from '@/lib/socket';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
    Search,
    Filter,
    Download,
    Droplet,
    Banknote,
    CreditCard,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface Sale {
    id: string;
    saleNumber: number;
    fuelType: 'PETROL' | 'DIESEL';
    liters: number;
    pricePerLiter: number;
    totalAmount: number;
    paymentMethod: 'CASH' | 'CARD' | 'CREDIT';
    vehicleNumber?: string;
    customerName?: string;
    saleDate: string;
    operator: {
        fullName: string;
    };
}

export default function AllSalesPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { showToast } = useToast();

    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [fuelFilter, setFuelFilter] = useState<'ALL' | 'PETROL' | 'DIESEL'>('ALL');
    const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'CASH' | 'CARD' | 'CREDIT'>('ALL');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        loadSales();
    }, [isAuthenticated, user, router]);

    // Listen for new sales and refresh
    useSocketEvent('sale:new', () => {
        loadSales();
        showToast('New sale recorded', 'success');
    });

    const loadSales = async () => {
        try {
            const data = await api.getTodaySales();
            setSales(data.sales || []);
        } catch (error) {
            console.error('Failed to load sales:', error);
            showToast('Failed to load sales data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(sale => {
        const matchesSearch =
            sale.saleNumber.toString().includes(searchQuery) ||
            sale.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sale.operator?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFuel = fuelFilter === 'ALL' || sale.fuelType === fuelFilter;
        const matchesPayment = paymentFilter === 'ALL' || sale.paymentMethod === paymentFilter;

        return matchesSearch && matchesFuel && matchesPayment;
    });

    const totals = filteredSales.reduce((acc, sale) => ({
        amount: acc.amount + Number(sale.totalAmount || 0),
        liters: acc.liters + Number(sale.liters || 0),
    }), { amount: 0, liters: 0 });

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
                    <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">All Sales</h1>
                    <p className="text-xs md:text-sm text-[var(--text-secondary)]">View and manage all sales transactions</p>
                </div>
                <Button icon={<Download className="w-4 h-4" />} className="w-full md:w-auto justify-center">
                    Export to Excel
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <Card className="p-4">
                    <p className="text-xs md:text-sm text-[var(--text-secondary)]">Total Sales</p>
                    <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                        Rs {totals.amount.toLocaleString()}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs md:text-sm text-[var(--text-secondary)]">Total Liters</p>
                    <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                        {Number(totals.liters).toFixed(2)} L
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs md:text-sm text-[var(--text-secondary)]">Transactions</p>
                    <p className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                        {filteredSales.length}
                    </p>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search by sale #, vehicle, operator..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {/* Fuel Type Filter */}
                        <select
                            value={fuelFilter}
                            onChange={(e) => setFuelFilter(e.target.value as any)}
                            className="input flex-1 md:w-40"
                        >
                            <option value="ALL">All Fuel</option>
                            <option value="PETROL">Petrol</option>
                            <option value="DIESEL">Diesel</option>
                        </select>

                        {/* Payment Filter */}
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value as any)}
                            className="input flex-1 md:w-40"
                        >
                            <option value="ALL">All Payments</option>
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="CREDIT">Credit</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Sales Table */}
            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--surface)] border-b border-[var(--border)]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Sale #</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Fuel</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Liters</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Operator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                                        No sales found
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-[var(--surface)] transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm font-medium">#{sale.saleNumber}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                                            {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={sale.fuelType === 'PETROL' ? 'warning' : 'info'}>
                                                {sale.fuelType}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">
                                            {Number(sale.liters).toFixed(2)} L
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            Rs {sale.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={
                                                sale.paymentMethod === 'CASH' ? 'success' :
                                                    sale.paymentMethod === 'CARD' ? 'info' : 'warning'
                                            }>
                                                {sale.paymentMethod}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                                            {sale.operator?.fullName || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
