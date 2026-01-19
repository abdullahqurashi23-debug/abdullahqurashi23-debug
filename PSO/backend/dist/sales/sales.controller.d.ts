import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto';
interface AuthUser {
    id: string;
    role: string;
    activeShiftId?: string;
}
export declare class SalesController {
    private salesService;
    constructor(salesService: SalesService);
    create(createDto: CreateSaleDto, user: AuthUser): Promise<{
        pricePerLiter: number;
        totalAmount: number;
        liters: number;
        id: string;
        operatorId: string;
        notes: string | null;
        saleDate: Date;
        saleNumber: number;
        shiftId: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        vehicleNumber: string | null;
        customerName: string | null;
        customerPhone: string | null;
        creditApprovedById: string | null;
        creditDueDate: Date | null;
        creditPaid: boolean;
        creditCustomerId: string | null;
    }>;
    getTodaySales(): Promise<{
        sales: ({
            operator: {
                fullName: string;
            };
        } & {
            id: string;
            operatorId: string;
            notes: string | null;
            saleDate: Date;
            saleNumber: number;
            shiftId: string;
            fuelType: import("@prisma/client").$Enums.FuelType;
            liters: import("@prisma/client/runtime/library").Decimal;
            pricePerLiter: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            vehicleNumber: string | null;
            customerName: string | null;
            customerPhone: string | null;
            creditApprovedById: string | null;
            creditDueDate: Date | null;
            creditPaid: boolean;
            creditCustomerId: string | null;
        })[];
        totals: {
            totalAmount: number;
            totalLiters: number;
            count: number;
            petrolLiters: number;
            dieselLiters: number;
        };
    }>;
    getMyTodaySales(user: AuthUser): Promise<{
        sales: {
            id: string;
            operatorId: string;
            notes: string | null;
            saleDate: Date;
            saleNumber: number;
            shiftId: string;
            fuelType: import("@prisma/client").$Enums.FuelType;
            liters: import("@prisma/client/runtime/library").Decimal;
            pricePerLiter: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            vehicleNumber: string | null;
            customerName: string | null;
            customerPhone: string | null;
            creditApprovedById: string | null;
            creditDueDate: Date | null;
            creditPaid: boolean;
            creditCustomerId: string | null;
        }[];
        totals: {
            totalAmount: number;
            totalLiters: number;
        };
    }>;
    getShiftSales(shiftId: string): Promise<({
        operator: {
            fullName: string;
        };
    } & {
        id: string;
        operatorId: string;
        notes: string | null;
        saleDate: Date;
        saleNumber: number;
        shiftId: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        liters: import("@prisma/client/runtime/library").Decimal;
        pricePerLiter: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        vehicleNumber: string | null;
        customerName: string | null;
        customerPhone: string | null;
        creditApprovedById: string | null;
        creditDueDate: Date | null;
        creditPaid: boolean;
        creditCustomerId: string | null;
    })[]>;
    getFuelPrices(): Promise<{
        PETROL: number;
        DIESEL: number;
    }>;
    updateFuelPrice(fuelType: string, price: number, user: AuthUser): Promise<{
        key: string;
        value: string;
        updatedAt: Date;
        updatedById: string | null;
    }>;
    getDashboardStats(): Promise<{
        todaySales: number;
        todayLiters: number;
        todayTransactions: number;
        cashInHand: number;
        activeOperators: number;
        yesterdaySales: number;
        percentageChange: string;
    }>;
    approveCreditSale(id: string, user: AuthUser): Promise<{
        id: string;
        operatorId: string;
        notes: string | null;
        saleDate: Date;
        saleNumber: number;
        shiftId: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        liters: import("@prisma/client/runtime/library").Decimal;
        pricePerLiter: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        vehicleNumber: string | null;
        customerName: string | null;
        customerPhone: string | null;
        creditApprovedById: string | null;
        creditDueDate: Date | null;
        creditPaid: boolean;
        creditCustomerId: string | null;
    }>;
    rejectCreditSale(id: string, user: AuthUser): Promise<{
        id: string;
        operatorId: string;
        notes: string | null;
        saleDate: Date;
        saleNumber: number;
        shiftId: string;
        fuelType: import("@prisma/client").$Enums.FuelType;
        liters: import("@prisma/client/runtime/library").Decimal;
        pricePerLiter: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        vehicleNumber: string | null;
        customerName: string | null;
        customerPhone: string | null;
        creditApprovedById: string | null;
        creditDueDate: Date | null;
        creditPaid: boolean;
        creditCustomerId: string | null;
    }>;
    getAnalytics(range: string): Promise<any[]>;
}
export {};
