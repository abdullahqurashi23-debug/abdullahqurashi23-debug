import { TanksService } from './tanks.service';
export declare class TanksController {
    private tanksService;
    constructor(tanksService: TanksService);
    findAll(): Promise<{
        id: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        capacity: import("@prisma/client/runtime/library").Decimal;
        currentLevel: import("@prisma/client/runtime/library").Decimal;
        minThreshold: import("@prisma/client/runtime/library").Decimal;
        lastUpdated: Date;
        lastRefillDate: Date | null;
        sensorConnected: boolean;
    }[]>;
    getStats(): Promise<{
        fuelType: import("@prisma/client").$Enums.FuelType;
        currentLevel: number;
        capacity: number;
        percentageFull: number;
        pricePerLiter: number;
        isLow: boolean;
        lastUpdated: Date;
        lastRefillDate: Date | null;
    }[]>;
    getDeliveries(take?: string): Promise<({
        receivedBy: {
            fullName: string;
        };
    } & {
        id: string;
        notes: string | null;
        fuelType: import("@prisma/client").$Enums.FuelType;
        pricePerLiter: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import("@prisma/client").$Enums.DeliveryPaymentStatus;
        supplierName: string;
        deliveryDate: Date;
        quantityLiters: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        invoiceNumber: string | null;
        invoiceDate: Date | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentDueDate: Date | null;
        tankLevelBefore: import("@prisma/client/runtime/library").Decimal;
        tankLevelAfter: import("@prisma/client/runtime/library").Decimal;
        density: import("@prisma/client/runtime/library").Decimal | null;
        temperature: import("@prisma/client/runtime/library").Decimal | null;
        receivedById: string;
    })[]>;
    findByType(fuelType: 'PETROL' | 'DIESEL'): Promise<{
        id: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        capacity: import("@prisma/client/runtime/library").Decimal;
        currentLevel: import("@prisma/client/runtime/library").Decimal;
        minThreshold: import("@prisma/client/runtime/library").Decimal;
        lastUpdated: Date;
        lastRefillDate: Date | null;
        sensorConnected: boolean;
    }>;
    setTankLevel(fuelType: 'PETROL' | 'DIESEL', data: {
        currentLevel: number;
    }): Promise<{
        id: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        capacity: import("@prisma/client/runtime/library").Decimal;
        currentLevel: import("@prisma/client/runtime/library").Decimal;
        minThreshold: import("@prisma/client/runtime/library").Decimal;
        lastUpdated: Date;
        lastRefillDate: Date | null;
        sensorConnected: boolean;
    }>;
    recordDelivery(data: {
        fuelType: 'PETROL' | 'DIESEL';
        quantityLiters: number;
        pricePerLiter: number;
        supplierName: string;
        invoiceNumber?: string;
        density?: number;
        temperature?: number;
    }, user: {
        id: string;
    }): Promise<{
        id: string;
        notes: string | null;
        fuelType: import("@prisma/client").$Enums.FuelType;
        pricePerLiter: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import("@prisma/client").$Enums.DeliveryPaymentStatus;
        supplierName: string;
        deliveryDate: Date;
        quantityLiters: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        invoiceNumber: string | null;
        invoiceDate: Date | null;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentDueDate: Date | null;
        tankLevelBefore: import("@prisma/client/runtime/library").Decimal;
        tankLevelAfter: import("@prisma/client/runtime/library").Decimal;
        density: import("@prisma/client/runtime/library").Decimal | null;
        temperature: import("@prisma/client/runtime/library").Decimal | null;
        receivedById: string;
    }>;
}
