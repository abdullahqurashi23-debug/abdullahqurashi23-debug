import { PrismaService } from '../prisma';
import { PumpGateway } from '../gateway/pump.gateway';
export declare class TanksService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: PumpGateway);
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
    updateLevel(fuelType: 'PETROL' | 'DIESEL', litersChange: number): Promise<{
        id: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        capacity: import("@prisma/client/runtime/library").Decimal;
        currentLevel: import("@prisma/client/runtime/library").Decimal;
        minThreshold: import("@prisma/client/runtime/library").Decimal;
        lastUpdated: Date;
        lastRefillDate: Date | null;
        sensorConnected: boolean;
    }>;
    setLevel(fuelType: 'PETROL' | 'DIESEL', newLevel: number): Promise<{
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
        receivedById: string;
    }): Promise<{
        id: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        supplierName: string;
        deliveryDate: Date;
        quantityLiters: import("@prisma/client/runtime/library").Decimal;
        pricePerLiter: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        invoiceNumber: string | null;
        invoiceDate: Date | null;
        paymentStatus: import("@prisma/client").$Enums.DeliveryPaymentStatus;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentDueDate: Date | null;
        tankLevelBefore: import("@prisma/client/runtime/library").Decimal;
        tankLevelAfter: import("@prisma/client/runtime/library").Decimal;
        density: import("@prisma/client/runtime/library").Decimal | null;
        temperature: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        receivedById: string;
    }>;
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
    getPredictions(): Promise<{
        fuelType: import("@prisma/client").$Enums.FuelType;
        currentLevel: number;
        capacity: number;
        avgDailyConsumption: number;
        daysUntilEmpty: number | null;
        daysUntilCritical: number | null;
        status: "CRITICAL" | "WARNING" | "OK";
        message: string;
    }[]>;
    private getPredictionMessage;
    getDeliveries(take?: number): Promise<({
        receivedBy: {
            fullName: string;
        };
    } & {
        id: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        supplierName: string;
        deliveryDate: Date;
        quantityLiters: import("@prisma/client/runtime/library").Decimal;
        pricePerLiter: import("@prisma/client/runtime/library").Decimal;
        totalCost: import("@prisma/client/runtime/library").Decimal;
        invoiceNumber: string | null;
        invoiceDate: Date | null;
        paymentStatus: import("@prisma/client").$Enums.DeliveryPaymentStatus;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        paymentDueDate: Date | null;
        tankLevelBefore: import("@prisma/client/runtime/library").Decimal;
        tankLevelAfter: import("@prisma/client/runtime/library").Decimal;
        density: import("@prisma/client/runtime/library").Decimal | null;
        temperature: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        receivedById: string;
    })[]>;
    private createLowFuelAlert;
    initializeTanks(): Promise<void>;
}
