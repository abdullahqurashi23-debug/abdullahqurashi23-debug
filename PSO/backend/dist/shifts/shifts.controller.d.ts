import { ShiftsService } from './shifts.service';
import { StartShiftDto, EndShiftDto } from './dto/shift.dto';
interface AuthUser {
    id: string;
    role: string;
}
export declare class ShiftsController {
    private shiftsService;
    constructor(shiftsService: ShiftsService);
    startShift(startDto: StartShiftDto, user: AuthUser): Promise<{
        message: string;
        shift: {
            id: string;
            shiftType: import("@prisma/client").$Enums.ShiftType;
            startTime: Date;
            openingCash: number;
            openingPetrolLevel: number;
            openingDieselLevel: number;
        };
    }>;
    endShift(shiftId: string, endDto: EndShiftDto, user: AuthUser): Promise<{
        message: string;
        summary: {
            shiftId: string;
            shiftType: import("@prisma/client").$Enums.ShiftType;
            duration: string;
            totalSales: number;
            totalLiters: number;
            cashCollected: number;
            cardPayments: number;
            creditSales: number;
            cashVariance: number;
            fuelVariance: number;
        };
    }>;
    getActiveShift(user: AuthUser): Promise<{
        totalSales: number;
        totalLiters: number;
        cashCollected: number;
        openingCash: number;
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
        id: string;
        status: import("@prisma/client").$Enums.ShiftStatus;
        operatorId: string;
        shiftType: import("@prisma/client").$Enums.ShiftType;
        startTime: Date;
        endTime: Date | null;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        openingPetrolLevel: import("@prisma/client/runtime/library").Decimal;
        openingDieselLevel: import("@prisma/client/runtime/library").Decimal;
        closingPetrolLevel: import("@prisma/client/runtime/library").Decimal | null;
        closingDieselLevel: import("@prisma/client/runtime/library").Decimal | null;
        cardPayments: import("@prisma/client/runtime/library").Decimal;
        creditSales: import("@prisma/client/runtime/library").Decimal;
        cashVariance: import("@prisma/client/runtime/library").Decimal | null;
        fuelVariance: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
    } | null>;
    getAllActiveShifts(): Promise<{
        id: string;
        operator: {
            username: string;
            fullName: string;
            id: string;
        };
        shiftType: import("@prisma/client").$Enums.ShiftType;
        startTime: Date;
        totalSales: number;
        totalLiters: number;
        duration: string;
        status: string;
    }[]>;
    getDailyShifts(): Promise<{
        id: string;
        operator: {
            username: string;
            fullName: string;
            id: string;
        };
        shiftType: import("@prisma/client").$Enums.ShiftType;
        startTime: Date;
        endTime: Date | null;
        status: import("@prisma/client").$Enums.ShiftStatus;
        totalSales: number;
        totalLiters: number;
        cashCollected: number;
        cardPayments: number;
        creditSales: number;
        duration: string;
    }[]>;
    getMyShiftHistory(user: AuthUser, take?: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ShiftStatus;
        shiftType: import("@prisma/client").$Enums.ShiftType;
        startTime: Date;
        endTime: Date | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalLiters: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getShiftDetails(shiftId: string): Promise<{
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
        operator: {
            username: string;
            fullName: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ShiftStatus;
        operatorId: string;
        shiftType: import("@prisma/client").$Enums.ShiftType;
        startTime: Date;
        endTime: Date | null;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        openingPetrolLevel: import("@prisma/client/runtime/library").Decimal;
        openingDieselLevel: import("@prisma/client/runtime/library").Decimal;
        closingPetrolLevel: import("@prisma/client/runtime/library").Decimal | null;
        closingDieselLevel: import("@prisma/client/runtime/library").Decimal | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalLiters: import("@prisma/client/runtime/library").Decimal;
        cashCollected: import("@prisma/client/runtime/library").Decimal;
        cardPayments: import("@prisma/client/runtime/library").Decimal;
        creditSales: import("@prisma/client/runtime/library").Decimal;
        cashVariance: import("@prisma/client/runtime/library").Decimal | null;
        fuelVariance: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
    }>;
}
export {};
