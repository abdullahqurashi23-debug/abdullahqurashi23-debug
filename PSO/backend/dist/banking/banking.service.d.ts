import { PrismaService } from '../prisma';
export declare class BankingService {
    private prisma;
    constructor(prisma: PrismaService);
    recordDeposit(data: {
        amount: number;
        bankName?: string;
        reference?: string;
        description?: string;
        depositedById: string;
    }): Promise<{
        message: string;
        transaction: {
            id: string;
            createdById: string;
            description: string | null;
            shiftId: string | null;
            transactionDate: Date;
            transactionType: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            bankName: string | null;
            accountNumber: string | null;
            referenceNumber: string | null;
            receiptImage: string | null;
            deliveryId: string | null;
        };
    }>;
    recordExpense(data: {
        amount: number;
        category: string;
        description?: string;
        vendor?: string;
    }, recordedById: string): Promise<{
        message: string;
        expense: {
            id: string;
            createdById: string;
            description: string | null;
            shiftId: string | null;
            transactionDate: Date;
            transactionType: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            bankName: string | null;
            accountNumber: string | null;
            referenceNumber: string | null;
            receiptImage: string | null;
            deliveryId: string | null;
        };
    }>;
    getTodayCashFlow(): Promise<{
        cashFromSales: number;
        deposited: number;
        expenses: number;
        cashInHand: number;
    }>;
    getTransactions(take?: number, type?: string): Promise<({
        createdBy: {
            fullName: string;
        };
    } & {
        id: string;
        createdById: string;
        description: string | null;
        shiftId: string | null;
        transactionDate: Date;
        transactionType: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        bankName: string | null;
        accountNumber: string | null;
        referenceNumber: string | null;
        receiptImage: string | null;
        deliveryId: string | null;
    })[]>;
    getExpenses(take?: number, category?: string): Promise<({
        createdBy: {
            fullName: string;
        };
    } & {
        id: string;
        createdById: string;
        description: string | null;
        shiftId: string | null;
        transactionDate: Date;
        transactionType: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        bankName: string | null;
        accountNumber: string | null;
        referenceNumber: string | null;
        receiptImage: string | null;
        deliveryId: string | null;
    })[]>;
    getExpensesByCategory(): Promise<{
        category: string;
        total: number;
        count: number;
    }[]>;
    getMonthlySummary(): Promise<{
        totalSales: number;
        totalDeposits: number;
        totalExpenses: number;
        fuelPurchases: number;
        profit: number;
    }>;
    getCreditCustomers(): Promise<{
        phone: string | null;
        cnic: string | null;
        id: string;
        status: string;
        createdAt: Date;
        customerName: string;
        address: string | null;
        companyName: string | null;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        totalOutstanding: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createCreditCustomer(data: {
        name: string;
        phone?: string;
        cnic?: string;
        address?: string;
        creditLimit: number;
    }): Promise<{
        phone: string | null;
        cnic: string | null;
        id: string;
        status: string;
        createdAt: Date;
        customerName: string;
        address: string | null;
        companyName: string | null;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        totalOutstanding: import("@prisma/client/runtime/library").Decimal;
    }>;
    receiveCreditPayment(customerId: string, amount: number, receivedById: string): Promise<{
        message: string;
        customer: {
            phone: string | null;
            cnic: string | null;
            id: string;
            status: string;
            createdAt: Date;
            customerName: string;
            address: string | null;
            companyName: string | null;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
            totalOutstanding: import("@prisma/client/runtime/library").Decimal;
        };
        amountReceived: number;
        newBalance: number;
    }>;
}
