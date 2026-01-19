import { BankingService } from './banking.service';
import { CreateExpenseDto } from './dto/banking.dto';
interface AuthUser {
    id: string;
    role: string;
}
export declare class BankingController {
    private bankingService;
    constructor(bankingService: BankingService);
    getCashFlow(): Promise<{
        cashFromSales: number;
        deposited: number;
        expenses: number;
        cashInHand: number;
    }>;
    getMonthlySummary(): Promise<{
        totalSales: number;
        totalDeposits: number;
        totalExpenses: number;
        fuelPurchases: number;
        profit: number;
    }>;
    getTransactions(take?: string, type?: string): Promise<({
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
    recordDeposit(data: {
        amount: number;
        bankName?: string;
        reference?: string;
        description?: string;
    }, user: AuthUser): Promise<{
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
    getExpenses(take?: string, category?: string): Promise<({
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
    recordExpense(data: CreateExpenseDto, user: AuthUser): Promise<{
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
    }, user: AuthUser): Promise<{
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
    receiveCreditPayment(customerId: string, amount: number, user: AuthUser): Promise<{
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
export {};
