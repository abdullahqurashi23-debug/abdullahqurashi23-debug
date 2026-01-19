import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class BankingService {
    constructor(private prisma: PrismaService) { }

    // Record bank deposit
    async recordDeposit(data: {
        amount: number;
        bankName?: string;
        reference?: string;
        description?: string;
        depositedById: string;
    }) {
        const transaction = await this.prisma.bankingTransaction.create({
            data: {
                transactionType: 'CASH_DEPOSIT',
                amount: data.amount,
                bankName: data.bankName,
                referenceNumber: data.reference,
                description: data.description || 'Bank deposit',
                createdById: data.depositedById,
            },
        });

        return {
            message: 'Deposit recorded successfully',
            transaction,
        };
    }

    // Record expense (using Sale with payment method OTHER or create a custom expense tracking)
    async recordExpense(
        data: { amount: number; category: string; description?: string; vendor?: string },
        recordedById: string,
    ) {
        // For now, record as a banking transaction with negative sign indication
        const expense = await this.prisma.bankingTransaction.create({
            data: {
                transactionType: `EXPENSE_${data.category}`,
                amount: data.amount,
                description: data.description || `${data.category} expense${data.vendor ? ` - ${data.vendor}` : ''}`,
                createdById: recordedById,
            },
        });

        return {
            message: 'Expense recorded successfully',
            expense,
        };
    }

    // Get today's cash flow summary
    async getTodayCashFlow() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Cash from sales
        const cashSales = await this.prisma.sale.aggregate({
            where: {
                saleDate: { gte: today },
                paymentMethod: 'CASH',
                paymentStatus: 'PAID',
            },
            _sum: { totalAmount: true },
        });

        // Deposits today
        const deposits = await this.prisma.bankingTransaction.aggregate({
            where: {
                transactionDate: { gte: today },
                transactionType: 'CASH_DEPOSIT',
            },
            _sum: { amount: true },
        });

        // Expenses today (any transaction type starting with EXPENSE_)
        const expenses = await this.prisma.bankingTransaction.aggregate({
            where: {
                transactionDate: { gte: today },
                transactionType: { startsWith: 'EXPENSE_' },
            },
            _sum: { amount: true },
        });

        const cashIn = Number(cashSales._sum?.totalAmount) || 0;
        const deposited = Number(deposits._sum?.amount) || 0;
        const expensesTotal = Number(expenses._sum?.amount) || 0;
        const cashInHand = cashIn - deposited - expensesTotal;

        return {
            cashFromSales: cashIn,
            deposited,
            expenses: expensesTotal,
            cashInHand,
        };
    }

    // Get bank transactions
    async getTransactions(take = 20, type?: string) {
        const where = type ? { transactionType: type } : {};

        return this.prisma.bankingTransaction.findMany({
            where,
            take,
            orderBy: { transactionDate: 'desc' },
            include: {
                createdBy: {
                    select: { fullName: true },
                },
            },
        });
    }

    // Get expenses
    async getExpenses(take = 20, category?: string) {
        const where = category
            ? { transactionType: `EXPENSE_${category}` }
            : { transactionType: { startsWith: 'EXPENSE_' } };

        return this.prisma.bankingTransaction.findMany({
            where,
            take,
            orderBy: { transactionDate: 'desc' },
            include: {
                createdBy: {
                    select: { fullName: true },
                },
            },
        });
    }

    // Get expense categories summary
    async getExpensesByCategory() {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const expenses = await this.prisma.bankingTransaction.groupBy({
            by: ['transactionType'],
            where: {
                transactionDate: { gte: monthStart },
                transactionType: { startsWith: 'EXPENSE_' },
            },
            _sum: { amount: true },
            _count: true,
        });

        return expenses.map((e) => ({
            category: e.transactionType.replace('EXPENSE_', ''),
            total: Number(e._sum?.amount) || 0,
            count: e._count,
        }));
    }

    // Get monthly summary
    async getMonthlySummary() {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        // Total sales
        const sales = await this.prisma.sale.aggregate({
            where: {
                saleDate: { gte: monthStart },
            },
            _sum: { totalAmount: true },
        });

        // Total deposits
        const deposits = await this.prisma.bankingTransaction.aggregate({
            where: {
                transactionDate: { gte: monthStart },
                transactionType: 'CASH_DEPOSIT',
            },
            _sum: { amount: true },
        });

        // Total expenses
        const expenses = await this.prisma.bankingTransaction.aggregate({
            where: {
                transactionDate: { gte: monthStart },
                transactionType: { startsWith: 'EXPENSE_' },
            },
            _sum: { amount: true },
        });

        // Fuel purchases
        const fuelPurchases = await this.prisma.fuelDelivery.aggregate({
            where: {
                deliveryDate: { gte: monthStart },
            },
            _sum: { totalCost: true },
        });

        const totalSales = Number(sales._sum?.totalAmount) || 0;
        const totalExpenses = Number(expenses._sum?.amount) || 0;
        const fuelCost = Number(fuelPurchases._sum?.totalCost) || 0;

        return {
            totalSales,
            totalDeposits: Number(deposits._sum?.amount) || 0,
            totalExpenses,
            fuelPurchases: fuelCost,
            profit: totalSales - fuelCost - totalExpenses,
        };
    }

    // Credit customers management
    async getCreditCustomers() {
        return this.prisma.creditCustomer.findMany({
            orderBy: { totalOutstanding: 'desc' },
        });
    }

    async createCreditCustomer(data: {
        name: string;
        phone?: string;
        cnic?: string;
        address?: string;
        creditLimit: number;
    }) {
        return this.prisma.creditCustomer.create({
            data: {
                customerName: data.name,
                phone: data.phone,
                cnic: data.cnic,
                address: data.address,
                creditLimit: data.creditLimit,
                totalOutstanding: 0,
            },
        });
    }

    async receiveCreditPayment(customerId: string, amount: number, receivedById: string) {
        const customer = await this.prisma.creditCustomer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            throw new NotFoundException('Credit customer not found');
        }

        const currentBalance = Number(customer.totalOutstanding);
        if (amount > currentBalance) {
            throw new BadRequestException('Payment exceeds outstanding balance');
        }

        // Update customer balance
        const updated = await this.prisma.creditCustomer.update({
            where: { id: customerId },
            data: {
                totalOutstanding: currentBalance - amount,
            },
        });

        // Record payment
        await this.prisma.creditPayment.create({
            data: {
                customerId,
                amount,
                paymentMethod: 'CASH',
                receivedById,
            },
        });

        // Record transaction
        await this.prisma.bankingTransaction.create({
            data: {
                transactionType: 'CREDIT_RECEIVED',
                amount,
                description: `Credit payment from ${customer.customerName}`,
                referenceNumber: `CREDIT-${customerId.slice(0, 8)}`,
                createdById: receivedById,
            },
        });

        return {
            message: 'Payment received successfully',
            customer: updated,
            amountReceived: amount,
            newBalance: currentBalance - amount,
        };
    }
}
