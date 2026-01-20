'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Truck, Plus, Calendar, FileText, Droplet } from 'lucide-react';

export default function DeliveriesPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { showToast } = useToast();

    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fuelType: 'PETROL',
        quantityLiters: '',
        pricePerLiter: '',
        supplierName: '',
        invoiceNumber: '',
    });

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        // In production, you'd have an API endpoint for deliveries
        setLoading(false);
    }, [isAuthenticated, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.recordDelivery({
                fuelType: formData.fuelType,
                quantityLiters: parseFloat(formData.quantityLiters),
                pricePerLiter: parseFloat(formData.pricePerLiter),
                supplierName: formData.supplierName,
                invoiceNumber: formData.invoiceNumber || undefined,
            });

            showToast('Delivery recorded successfully!', 'success');
            setShowModal(false);
            setFormData({
                fuelType: 'PETROL',
                quantityLiters: '',
                pricePerLiter: '',
                supplierName: '',
                invoiceNumber: '',
            });
        } catch (error: any) {
            showToast(error.message || 'Failed to record delivery', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalValue = formData.quantityLiters && formData.pricePerLiter
        ? parseFloat(formData.quantityLiters) * parseFloat(formData.pricePerLiter)
        : 0;

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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Fuel Deliveries</h1>
                    <p className="text-[var(--text-secondary)]">Track fuel supply and deliveries</p>
                </div>
                <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowModal(true)}
                >
                    Record Delivery
                </Button>
            </div>

            {/* Recent Deliveries */}
            <Card>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Recent Deliveries</h3>

                {deliveries.length === 0 ? (
                    <div className="text-center py-12">
                        <Truck className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <p className="text-[var(--text-secondary)]">No deliveries recorded yet</p>
                        <Button
                            variant="secondary"
                            className="mt-4"
                            onClick={() => setShowModal(true)}
                        >
                            Record First Delivery
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {deliveries.map((delivery) => (
                            <div
                                key={delivery.id}
                                className="p-4 border border-[var(--border)] rounded-lg flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${delivery.fuelType === 'PETROL'
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-teal-100 text-teal-600'
                                        }`}>
                                        <Droplet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{delivery.fuelType}</p>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {delivery.supplierName}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{delivery.quantityLiters.toLocaleString()} L</p>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Rs {(delivery.quantityLiters * delivery.pricePerLiter).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Record Delivery Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Record Fuel Delivery"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Fuel Type */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Fuel Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['PETROL', 'DIESEL'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, fuelType: type })}
                                    className={`p-3 rounded-lg border-2 font-medium transition-all ${formData.fuelType === type
                                            ? type === 'PETROL'
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-teal-500 bg-teal-50 text-teal-700'
                                            : 'border-[var(--border)] text-[var(--text-secondary)]'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Quantity (Liters)
                        </label>
                        <Input
                            type="number"
                            placeholder="e.g., 5000"
                            value={formData.quantityLiters}
                            onChange={(e) => setFormData({ ...formData, quantityLiters: e.target.value })}
                            required
                        />
                    </div>

                    {/* Price per Liter */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Price per Liter (Rs)
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 260.50"
                            value={formData.pricePerLiter}
                            onChange={(e) => setFormData({ ...formData, pricePerLiter: e.target.value })}
                            required
                        />
                    </div>

                    {/* Total Value Display */}
                    {totalValue > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600">Total Value</p>
                            <p className="text-xl font-bold text-blue-900">
                                Rs {totalValue.toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Supplier Name */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Supplier Name
                        </label>
                        <Input
                            type="text"
                            placeholder="e.g., PSO Depot"
                            value={formData.supplierName}
                            onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                            required
                        />
                    </div>

                    {/* Invoice Number */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            Invoice Number (Optional)
                        </label>
                        <Input
                            type="text"
                            placeholder="e.g., INV-2026-001"
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            fullWidth
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isSubmitting}
                        >
                            Record Delivery
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
