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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const tanks_service_1 = require("../tanks/tanks.service");
const pump_gateway_1 = require("../gateway/pump.gateway");
const FUEL_PRICES = {
    PETROL: 290.00,
    DIESEL: 294.00,
};
let SalesService = class SalesService {
    prisma;
    tanksService;
    gateway;
    constructor(prisma, tanksService, gateway) {
        this.prisma = prisma;
        this.tanksService = tanksService;
        this.gateway = gateway;
    }
    async create(createDto, operatorId, shiftId) {
        const pricePerLiter = await this.getFuelPrice(createDto.fuelType);
        const totalAmount = createDto.liters * pricePerLiter;
        const shift = await this.prisma.shift.findUnique({
            where: { id: shiftId },
            include: { operator: { select: { fullName: true } } },
        });
        if (!shift || shift.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('No active shift found. Please start a shift first.');
        }
        if (shift.operatorId !== operatorId) {
            throw new common_1.BadRequestException('Shift does not belong to this operator');
        }
        const tank = await this.tanksService.findByType(createDto.fuelType);
        if (Number(tank.currentLevel) < createDto.liters) {
            throw new common_1.BadRequestException(`Insufficient ${createDto.fuelType} in tank. Available: ${tank.currentLevel}L`);
        }
        const paymentStatus = createDto.paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID';
        const sale = await this.prisma.$transaction(async (tx) => {
            const newSale = await tx.sale.create({
                data: {
                    operatorId,
                    shiftId,
                    fuelType: createDto.fuelType,
                    liters: createDto.liters,
                    pricePerLiter,
                    totalAmount,
                    paymentMethod: createDto.paymentMethod,
                    paymentStatus: paymentStatus,
                    vehicleNumber: createDto.vehicleNumber,
                    customerName: createDto.customerName,
                    customerPhone: createDto.customerPhone,
                    creditCustomerId: createDto.creditCustomerId,
                    notes: createDto.notes,
                },
            });
            const updateData = {
                totalSales: { increment: totalAmount },
                totalLiters: { increment: createDto.liters },
            };
            if (createDto.paymentMethod === 'CASH') {
                updateData.cashCollected = { increment: totalAmount };
            }
            else if (createDto.paymentMethod === 'CARD') {
                updateData.cardPayments = { increment: totalAmount };
            }
            else if (createDto.paymentMethod === 'CREDIT') {
                updateData.creditSales = { increment: totalAmount };
            }
            await tx.shift.update({
                where: { id: shiftId },
                data: updateData,
            });
            return newSale;
        });
        await this.tanksService.updateLevel(createDto.fuelType, -createDto.liters);
        this.gateway.emitNewSale({
            id: sale.id,
            operatorName: shift.operator.fullName,
            fuelType: createDto.fuelType,
            liters: createDto.liters,
            amount: totalAmount,
            paymentMethod: createDto.paymentMethod,
            timestamp: new Date(),
        });
        if (createDto.paymentMethod === 'CREDIT') {
            this.gateway.emitAlert({
                id: sale.id,
                type: 'CREDIT_APPROVAL',
                severity: 'INFO',
                message: `Credit sale Rs ${totalAmount.toFixed(0)} by ${shift.operator.fullName} needs approval`,
                timestamp: new Date(),
            });
        }
        return {
            ...sale,
            pricePerLiter: Number(sale.pricePerLiter),
            totalAmount: Number(sale.totalAmount),
            liters: Number(sale.liters),
        };
    }
    async getShiftSales(shiftId) {
        return this.prisma.sale.findMany({
            where: { shiftId },
            orderBy: { saleDate: 'desc' },
            include: {
                operator: { select: { fullName: true } },
            },
        });
    }
    async getTodaySales() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sales = await this.prisma.sale.findMany({
            where: {
                saleDate: { gte: today },
            },
            orderBy: { saleDate: 'desc' },
            include: {
                operator: { select: { fullName: true } },
            },
        });
        const totals = sales.reduce((acc, sale) => {
            acc.totalAmount += Number(sale.totalAmount);
            acc.totalLiters += Number(sale.liters);
            acc.count += 1;
            if (sale.fuelType === 'PETROL') {
                acc.petrolLiters += Number(sale.liters);
            }
            else {
                acc.dieselLiters += Number(sale.liters);
            }
            return acc;
        }, { totalAmount: 0, totalLiters: 0, count: 0, petrolLiters: 0, dieselLiters: 0 });
        return {
            sales,
            totals,
        };
    }
    async getOperatorTodaySales(operatorId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sales = await this.prisma.sale.findMany({
            where: {
                operatorId,
                saleDate: { gte: today },
            },
            orderBy: { saleDate: 'desc' },
        });
        const totals = sales.reduce((acc, sale) => {
            acc.totalAmount += Number(sale.totalAmount);
            acc.totalLiters += Number(sale.liters);
            return acc;
        }, { totalAmount: 0, totalLiters: 0 });
        return { sales, totals };
    }
    async approveCreditSale(saleId, adminId) {
        const sale = await this.prisma.sale.findUnique({
            where: { id: saleId },
            include: { operator: true },
        });
        if (!sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        if (sale.paymentMethod !== 'CREDIT') {
            throw new common_1.BadRequestException('This is not a credit sale');
        }
        const updated = await this.prisma.sale.update({
            where: { id: saleId },
            data: {
                paymentStatus: 'APPROVED',
                creditApprovedById: adminId,
            },
        });
        this.gateway.emitCreditApproval(sale.operatorId, {
            saleId: sale.id,
            approved: true,
            customerName: sale.customerName || 'Customer',
            amount: Number(sale.totalAmount),
        });
        return updated;
    }
    async rejectCreditSale(saleId, adminId) {
        const sale = await this.prisma.sale.findUnique({
            where: { id: saleId },
            include: { operator: true },
        });
        if (!sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        const updated = await this.prisma.sale.update({
            where: { id: saleId },
            data: {
                paymentStatus: 'REJECTED',
                creditApprovedById: adminId,
            },
        });
        this.gateway.emitCreditApproval(sale.operatorId, {
            saleId: sale.id,
            approved: false,
            customerName: sale.customerName || 'Customer',
            amount: Number(sale.totalAmount),
        });
        return updated;
    }
    async getFuelPrice(fuelType) {
        const setting = await this.prisma.setting.findUnique({
            where: { key: `${fuelType.toLowerCase()}_price` },
        });
        if (setting) {
            return parseFloat(setting.value);
        }
        return FUEL_PRICES[fuelType] || 263.45;
    }
    async getFuelPrices() {
        const petrolSetting = await this.prisma.setting.findUnique({
            where: { key: 'petrol_price' },
        });
        const dieselSetting = await this.prisma.setting.findUnique({
            where: { key: 'diesel_price' },
        });
        return {
            PETROL: petrolSetting ? parseFloat(petrolSetting.value) : FUEL_PRICES.PETROL,
            DIESEL: dieselSetting ? parseFloat(dieselSetting.value) : FUEL_PRICES.DIESEL,
        };
    }
    async updateFuelPrice(fuelType, price, adminId) {
        return this.prisma.setting.upsert({
            where: { key: `${fuelType.toLowerCase()}_price` },
            update: {
                value: price.toString(),
                updatedById: adminId,
                updatedAt: new Date(),
            },
            create: {
                key: `${fuelType.toLowerCase()}_price`,
                value: price.toString(),
                updatedById: adminId,
            },
        });
    }
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const todaySales = await this.prisma.sale.aggregate({
            where: { saleDate: { gte: today } },
            _sum: { totalAmount: true, liters: true },
            _count: true,
        });
        const yesterdaySales = await this.prisma.sale.aggregate({
            where: {
                saleDate: { gte: yesterday, lt: today },
            },
            _sum: { totalAmount: true },
        });
        const activeShifts = await this.prisma.shift.count({
            where: { status: 'ACTIVE' },
        });
        const cashToday = await this.prisma.sale.aggregate({
            where: {
                saleDate: { gte: today },
                paymentMethod: 'CASH',
            },
            _sum: { totalAmount: true },
        });
        const todayTotal = Number(todaySales._sum.totalAmount) || 0;
        const yesterdayTotal = Number(yesterdaySales._sum.totalAmount) || 0;
        const percentageChange = yesterdayTotal > 0
            ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
            : 0;
        return {
            todaySales: todayTotal,
            todayLiters: Number(todaySales._sum.liters) || 0,
            todayTransactions: todaySales._count || 0,
            cashInHand: Number(cashToday._sum.totalAmount) || 0,
            activeOperators: activeShifts,
            yesterdaySales: yesterdayTotal,
            percentageChange: percentageChange.toFixed(1),
        };
    }
    async getAnalytics(range = '7days') {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        if (range === '30days') {
            startDate.setDate(startDate.getDate() - 30);
        }
        else {
            startDate.setDate(startDate.getDate() - 7);
        }
        const sales = await this.prisma.sale.findMany({
            where: {
                saleDate: { gte: startDate },
            },
            orderBy: { saleDate: 'asc' },
        });
        const dailyMap = new Map();
        const currentDate = new Date(startDate);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            dailyMap.set(dateKey, {
                date: dateKey,
                totalSales: 0,
                totalLiters: 0,
                petrol: 0,
                diesel: 0,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        sales.forEach((sale) => {
            const dateKey = sale.saleDate.toISOString().split('T')[0];
            if (dailyMap.has(dateKey)) {
                const day = dailyMap.get(dateKey);
                day.totalSales += Number(sale.totalAmount);
                day.totalLiters += Number(sale.liters);
                if (sale.fuelType === 'PETROL') {
                    day.petrol += Number(sale.liters);
                }
                else {
                    day.diesel += Number(sale.liters);
                }
            }
        });
        return Array.from(dailyMap.values());
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        tanks_service_1.TanksService,
        pump_gateway_1.PumpGateway])
], SalesService);
//# sourceMappingURL=sales.service.js.map