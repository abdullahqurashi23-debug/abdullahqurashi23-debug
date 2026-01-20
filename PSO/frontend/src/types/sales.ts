export interface Sale {
    id: string;
    amount: number;
    liters: number;
    fuelType: 'PETROL' | 'DIESEL';
    paymentMethod: 'CASH' | 'CARD' | 'CREDIT';
    operatorName?: string;
    timestamp?: string;
    saleDate?: string;
    startReading?: number;
    endReading?: number;
}
