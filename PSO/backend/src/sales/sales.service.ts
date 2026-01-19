import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TanksService } from '../tanks/tanks.service';
import { PumpGateway } from '../gateway/pump.gateway';
import { CreateSaleDto } from './dto';

// Current fuel prices (should be from settings in production)
const FUEL_PRICES = {
    PETROL: 290.00,
    DIESEL: 294.00,
};

@Injectable()
export class SalesService {
    constructor(
        private prisma: PrismaService,
        private tanksService: TanksService,
        private gateway: PumpGateway,
    ) { }

    // Record a new sale
    async create(
        createDto: CreateSaleDto,
        operatorId: string,
        shiftId: string,
    ) {
        // Get current fuel price
        const pricePerLiter = await this.getFuelPrice(createDto.fuelType);
        const totalAmount = createDto.liters * pricePerLiter;

        // Verify shift is active
        const shift = await this.prisma.shift.findUnique({
            where: { id: shiftId },
            include: { operator: { select: { fullName: true } } },
        });

        if (!shift || shift.status !== 'ACTIVE') {
            throw new BadRequestException('No active shift found. Please start a shift first.');
        }

        if (shift.operatorId !== operatorId) {
            throw new BadRequestException('Shift does not belong to this operator');
        }

        // Check tank level
        const tank = await this.tanksService.findByType(createDto.fuelType as any);
        if (Number(tank.currentLevel) < createDto.liters) {
            throw new BadRequestException(
                `Insufficient ${createDto.fuelType} in tank. Available: ${tank.currentLevel}L`,
            );
        }

        // Determine payment status
        const paymentStatus = createDto.paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID';

        // Create sale in transaction
        const sale = await this.prisma.$transaction(async (tx) => {
            // 1. Create sale record
            const newSale = await tx.sale.create({
                data: {
                    operatorId,
                    shiftId,
                    fuelType: createDto.fuelType as any,
                    liters: createDto.liters,
                    pricePerLiter,
                    totalAmount,
                    paymentMethod: createDto.paymentMethod as any,
                    paymentStatus: paymentStatus as any,
                    vehicleNumber: createDto.vehicleNumber,
                    customerName: createDto.customerName,
                    customerPhone: createDto.customerPhone,
                    creditCustomerId: createDto.creditCustomerId,
                    notes: createDto.notes,
                },
            });

            // 2. Update shift totals
            const updateData: any = {
                totalSales: { increment: totalAmount },
                totalLiters: { increment: createDto.liters },
            };

            if (createDto.paymentMethod === 'CASH') {
                updateData.cashCollected = { increment: totalAmount };
            } else if (createDto.paymentMethod === 'CARD') {
                updateData.cardPayments = { increment: totalAmount };
            } else if (createDto.paymentMethod === 'CREDIT') {
                updateData.creditSales = { increment: totalAmount };
            }

            await tx.shift.update({
                where: { id: shiftId },
                data: updateData,
            });

            return newSale;
        });

        // 3. Update tank level (outside transaction for real-time updates)
        await this.tanksService.updateLevel(createDto.fuelType as any, -createDto.liters);

        // 4. Emit real-time event
        this.gateway.emitNewSale({
            id: sale.id,
            operatorName: shift.operator.fullName,
            fuelType: createDto.fuelType,
            liters: createDto.liters,
            amount: totalAmount,
            paymentMethod: createDto.paymentMethod,
            timestamp: new Date(),
        });

        // 5. If credit sale, notify admin for approval
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

    // Get sales for current shift
    async getShiftSales(shiftId: string) {
        return this.prisma.sale.findMany({
            where: { shiftId },
            orderBy: { saleDate: 'desc' },
            include: {
                operator: { select: { fullName: true } },
            },
        });
    }

    // Get today's sales (for dashboard)
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

        // Calculate totals
        const totals = sales.reduce(
            (acc, sale) => {
                acc.totalAmount += Number(sale.totalAmount);
                acc.totalLiters += Number(sale.liters);
                acc.count += 1;
                if (sale.fuelType === 'PETROL') {
                    acc.petrolLiters += Number(sale.liters);
                } else {
                    acc.dieselLiters += Number(sale.liters);
                }
                return acc;
            },
            { totalAmount: 0, totalLiters: 0, count: 0, petrolLiters: 0, dieselLiters: 0 },
        );

        return {
            sales,
            totals,
        };
    }

    // Get operator's today sales
    async getOperatorTodaySales(operatorId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sales = await this.prisma.sale.findMany({
            where: {
                operatorId,
                saleDate: { gte: today },
            },
            orderBy: { saleDate: 'desc' },
        });

        const totals = sales.reduce(
            (acc, sale) => {
                acc.totalAmount += Number(sale.totalAmount);
                acc.totalLiters += Number(sale.liters);
                return acc;
            },
            { totalAmount: 0, totalLiters: 0 },
        );

        return { sales, totals };
    }

    // Admin: Approve credit sale
    async approveCreditSale(saleId: string, adminId: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id: saleId },
            include: { operator: true },
        });

        if (!sale) {
            throw new NotFoundException('Sale not found');
        }

        if (sale.paymentMethod !== 'CREDIT') {
            throw new BadRequestException('This is not a credit sale');
        }

        const updated = await this.prisma.sale.update({
            where: { id: saleId },
            data: {
                paymentStatus: 'APPROVED',
                creditApprovedById: adminId,
            },
        });

        // Notify operator
        this.gateway.emitCreditApproval(sale.operatorId, {
            saleId: sale.id,
            approved: true,
            customerName: sale.customerName || 'Customer',
            amount: Number(sale.totalAmount),
        });

        return updated;
    }

    // Admin: Reject credit sale
    async rejectCreditSale(saleId: string, adminId: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id: saleId },
            include: { operator: true },
        });

        if (!sale) {
            throw new NotFoundException('Sale not found');
        }

        const updated = await this.prisma.sale.update({
            where: { id: saleId },
            data: {
                paymentStatus: 'REJECTED',
                creditApprovedById: adminId,
            },
        });

        // Notify operator
        this.gateway.emitCreditApproval(sale.operatorId, {
            saleId: sale.id,
            approved: false,
            customerName: sale.customerName || 'Customer',
            amount: Number(sale.totalAmount),
        });

        return updated;
    }

    // Get current fuel prices
    private async getFuelPrice(fuelType: string): Promise<number> {
        const setting = await this.prisma.setting.findUnique({
            where: { key: `${fuelType.toLowerCase()}_price` },
        });

        if (setting) {
            return parseFloat(setting.value);
        }

        return FUEL_PRICES[fuelType as keyof typeof FUEL_PRICES] || 263.45;
    }

    // Get fuel prices for display
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

    // Update fuel price (admin only)
    async updateFuelPrice(fuelType: string, price: number, adminId: string) {
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

    // Dashboard stats
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Today's totals
        const todaySales = await this.prisma.sale.aggregate({
            where: { saleDate: { gte: today } },
            _sum: { totalAmount: true, liters: true },
            _count: true,
        });

        // Yesterday's totals (for comparison)
        const yesterdaySales = await this.prisma.sale.aggregate({
            where: {
                saleDate: { gte: yesterday, lt: today },
            },
            _sum: { totalAmount: true },
        });

        // Active shifts
        const activeShifts = await this.prisma.shift.count({
            where: { status: 'ACTIVE' },
        });

        // Cash collected today
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
    // Analytics for charts
    async getAnalytics(range: string = '7days') {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        if (range === '30days') {
            startDate.setDate(startDate.getDate() - 30);
        } else {
            startDate.setDate(startDate.getDate() - 7);
        }

        const sales = await this.prisma.sale.findMany({
            where: {
                saleDate: { gte: startDate },
            },
            orderBy: { saleDate: 'asc' },
        });

        const dailyMap = new Map();

        // Initialize map with all dates in range (to ensure continuous line chart)
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

        // Fill with actual data
        sales.forEach((sale) => {
            const dateKey = sale.saleDate.toISOString().split('T')[0];
            if (dailyMap.has(dateKey)) {
                const day = dailyMap.get(dateKey);
                day.totalSales += Number(sale.totalAmount);
                day.totalLiters += Number(sale.liters);
                if (sale.fuelType === 'PETROL') {
                    day.petrol += Number(sale.liters);
                } else {
                    day.diesel += Number(sale.liters);
                }
            }
        });

        return Array.from(dailyMap.values());
    }
}
