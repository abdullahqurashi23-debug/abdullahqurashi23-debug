"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let BankingService = class BankingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordDeposit(data) {
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
    async recordExpense(data, recordedById) {
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
    async getTodayCashFlow() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cashSales = await this.prisma.sale.aggregate({
            where: {
                saleDate: { gte: today },
                paymentMethod: 'CASH',
                paymentStatus: 'PAID',
            },
            _sum: { totalAmount: true },
        });
        const deposits = await this.prisma.bankingTransaction.aggregate({
            where: {
                transactionDate: { gte: today },
                transactionType: 'CASH_DEPOSIT',
            },
            _sum: { amount: true },
        });
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
    async getTransactions(take = 20, type) {
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
    async getExpenses(take = 20, category) {
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
    async getMonthlySummary() {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const sales = await this.prisma.sale.aggregate({
            where: {
                saleDate: { gte: monthStart },
            },
            _sum: { totalAmount: true },
        });
        const deposits = await this.prisma.bankingTransaction.aggregate({
            where: {
                transactionDate: { gte: monthStart },
                transactionType: 'CASH_DEPOSIT',
            },
            _sum: { amount: true },
        });
        const expenses = await this.prisma.bankingTransaction.aggregate({
            where: {
                transactionDate: { gte: monthStart },
                transactionType: { startsWith: 'EXPENSE_' },
            },
            _sum: { amount: true },
        });
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
    async getCreditCustomers() {
        return this.prisma.creditCustomer.findMany({
            orderBy: { totalOutstanding: 'desc' },
        });
    }
    async createCreditCustomer(data) {
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
    async receiveCreditPayment(customerId, amount, receivedById) {
        const customer = await this.prisma.creditCustomer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Credit customer not found');
        }
        const currentBalance = Number(customer.totalOutstanding);
        if (amount > currentBalance) {
            throw new common_1.BadRequestException('Payment exceeds outstanding balance');
        }
        const updated = await this.prisma.creditCustomer.update({
            where: { id: customerId },
            data: {
                totalOutstanding: currentBalance - amount,
            },
        });
        await this.prisma.creditPayment.create({
            data: {
                customerId,
                amount,
                paymentMethod: 'CASH',
                receivedById,
            },
        });
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
};
exports.BankingService = BankingService;
exports.BankingService = BankingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], BankingService);
//# sourceMappingURL=banking.service.js.map