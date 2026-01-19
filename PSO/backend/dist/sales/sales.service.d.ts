import { PrismaService } from '../prisma';
import { TanksService } from '../tanks/tanks.service';
import { PumpGateway } from '../gateway/pump.gateway';
import { CreateSaleDto } from './dto';
export declare class SalesService {
    private prisma;
    private tanksService;
    private gateway;
    constructor(prisma: PrismaService, tanksService: TanksService, gateway: PumpGateway);
    create(createDto: CreateSaleDto, operatorId: string, shiftId: string): Promise<{
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
    getOperatorTodaySales(operatorId: string): Promise<{
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
    approveCreditSale(saleId: string, adminId: string): Promise<{
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
    rejectCreditSale(saleId: string, adminId: string): Promise<{
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
    private getFuelPrice;
    getFuelPrices(): Promise<{
        PETROL: number;
        DIESEL: number;
    }>;
    updateFuelPrice(fuelType: string, price: number, adminId: string): Promise<{
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
    getAnalytics(range?: string): Promise<any[]>;
}
