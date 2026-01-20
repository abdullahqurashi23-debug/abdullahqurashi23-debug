import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PumpGateway } from '../gateway/pump.gateway';

@Injectable()
export class TanksService {
    constructor(
        private prisma: PrismaService,
        private gateway: PumpGateway,
    ) { }

    // Get all tanks with current levels
    async findAll() {
        return this.prisma.fuelTank.findMany({
            orderBy: { fuelType: 'asc' },
        });
    }

    // Get single tank by fuel type
    async findByType(fuelType: 'PETROL' | 'DIESEL') {
        const tank = await this.prisma.fuelTank.findUnique({
            where: { fuelType },
        });

        if (!tank) {
            throw new NotFoundException(`${fuelType} tank not found`);
        }

        return tank;
    }

    // Update tank level (called after sale)
    async updateLevel(fuelType: 'PETROL' | 'DIESEL', litersChange: number) {
        const tank = await this.findByType(fuelType);

        const previousLevel = Number(tank.currentLevel);
        const newLevel = previousLevel + litersChange;

        // Ensure level doesn't go below 0
        const finalLevel = Math.max(0, newLevel);

        const updated = await this.prisma.fuelTank.update({
            where: { fuelType },
            data: {
                currentLevel: finalLevel,
                lastUpdated: new Date(),
            },
        });

        // Calculate percentage
        const capacity = Number(tank.capacity);
        const percentageFull = (finalLevel / capacity) * 100;

        // Emit real-time update
        this.gateway.emitTankUpdate({
            fuelType,
            previousLevel,
            currentLevel: finalLevel,
            capacity,
            percentageFull,
        });

        // Check for low fuel alert
        if (finalLevel <= Number(tank.minThreshold)) {
            await this.createLowFuelAlert(fuelType, finalLevel, percentageFull);
        }

        return updated;
    }

    // Set tank level directly (admin only - for resets, corrections)
    async setLevel(fuelType: 'PETROL' | 'DIESEL', newLevel: number) {
        const tank = await this.findByType(fuelType);

        const previousLevel = Number(tank.currentLevel);
        const capacity = Number(tank.capacity);

        // Ensure level is between 0 and capacity
        const finalLevel = Math.max(0, Math.min(newLevel, capacity));

        const updated = await this.prisma.fuelTank.update({
            where: { fuelType },
            data: {
                currentLevel: finalLevel,
                lastUpdated: new Date(),
            },
        });

        const percentageFull = (finalLevel / capacity) * 100;

        // Emit real-time update
        this.gateway.emitTankUpdate({
            fuelType,
            previousLevel,
            currentLevel: finalLevel,
            capacity,
            percentageFull,
        });

        // Check for low fuel alert
        if (finalLevel <= Number(tank.minThreshold)) {
            await this.createLowFuelAlert(fuelType, finalLevel, percentageFull);
        }

        return updated;
    }

    // Record fuel delivery (tanker arrival)
    async recordDelivery(data: {
        fuelType: 'PETROL' | 'DIESEL';
        quantityLiters: number;
        pricePerLiter: number;
        supplierName: string;
        invoiceNumber?: string;
        density?: number;
        temperature?: number;
        receivedById: string;
    }) {
        const tank = await this.findByType(data.fuelType);
        const tankLevelBefore = Number(tank.currentLevel);
        const tankLevelAfter = tankLevelBefore + data.quantityLiters;

        // Create delivery record
        const delivery = await this.prisma.fuelDelivery.create({
            data: {
                fuelType: data.fuelType,
                quantityLiters: data.quantityLiters,
                pricePerLiter: data.pricePerLiter,
                totalCost: data.quantityLiters * data.pricePerLiter,
                supplierName: data.supplierName,
                invoiceNumber: data.invoiceNumber,
                tankLevelBefore,
                tankLevelAfter,
                density: data.density,
                temperature: data.temperature,
                receivedById: data.receivedById,
            },
        });

        // Update tank level
        await this.prisma.fuelTank.update({
            where: { fuelType: data.fuelType },
            data: {
                currentLevel: tankLevelAfter,
                lastRefillDate: new Date(),
                lastUpdated: new Date(),
            },
        });

        // Emit tank update
        const capacity = Number(tank.capacity);
        this.gateway.emitTankUpdate({
            fuelType: data.fuelType,
            previousLevel: tankLevelBefore,
            currentLevel: tankLevelAfter,
            capacity,
            percentageFull: (tankLevelAfter / capacity) * 100,
        });

        return delivery;
    }

    // Get tank statistics for dashboard
    async getStats() {
        const tanks = await this.findAll();

        // Get current fuel prices from settings (same source as sales service)
        const petrolSetting = await this.prisma.setting.findUnique({
            where: { key: 'petrol_price' },
        });
        const dieselSetting = await this.prisma.setting.findUnique({
            where: { key: 'diesel_price' },
        });

        const fuelPrices = {
            PETROL: petrolSetting ? parseFloat(petrolSetting.value) : 290.00,
            DIESEL: dieselSetting ? parseFloat(dieselSetting.value) : 294.00,
        };

        return tanks.map((tank) => {
            const currentLevel = Number(tank.currentLevel);
            const capacity = Number(tank.capacity);
            const minThreshold = Number(tank.minThreshold);
            const percentageFull = (currentLevel / capacity) * 100;
            const pricePerLiter = fuelPrices[tank.fuelType as keyof typeof fuelPrices] || 0;

            return {
                fuelType: tank.fuelType,
                currentLevel,
                capacity,
                percentageFull,
                pricePerLiter,
                isLow: currentLevel <= minThreshold,
                lastUpdated: tank.lastUpdated,
                lastRefillDate: tank.lastRefillDate,
            };
        });
    }

    // Get tank run-out predictions based on average daily consumption
    async getPredictions() {
        const tanks = await this.findAll();

        // Get sales from last 7 days to calculate average daily consumption
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSales = await this.prisma.sale.groupBy({
            by: ['fuelType'],
            where: {
                saleDate: { gte: sevenDaysAgo },
            },
            _sum: {
                liters: true,
            },
        });

        const predictions = tanks.map((tank) => {
            const currentLevel = Number(tank.currentLevel);
            const capacity = Number(tank.capacity);
            const minThreshold = Number(tank.minThreshold);

            // Find sales for this fuel type
            const salesData = recentSales.find((s) => s.fuelType === tank.fuelType);
            const totalLitersLast7Days = salesData?._sum?.liters ? Number(salesData._sum.liters) : 0;

            // Calculate average daily consumption
            const avgDailyConsumption = totalLitersLast7Days / 7;

            // Calculate days until empty and days until critical (at min threshold)
            let daysUntilEmpty = null;
            let daysUntilCritical = null;

            if (avgDailyConsumption > 0) {
                daysUntilEmpty = Math.floor(currentLevel / avgDailyConsumption);
                const litersAboveThreshold = currentLevel - minThreshold;
                daysUntilCritical = litersAboveThreshold > 0
                    ? Math.floor(litersAboveThreshold / avgDailyConsumption)
                    : 0;
            }

            // Determine status
            let status: 'CRITICAL' | 'WARNING' | 'OK' = 'OK';
            if (daysUntilCritical !== null) {
                if (daysUntilCritical <= 1) status = 'CRITICAL';
                else if (daysUntilCritical <= 3) status = 'WARNING';
            }

            return {
                fuelType: tank.fuelType,
                currentLevel,
                capacity,
                avgDailyConsumption: Math.round(avgDailyConsumption),
                daysUntilEmpty,
                daysUntilCritical,
                status,
                message: this.getPredictionMessage(tank.fuelType, daysUntilEmpty, avgDailyConsumption),
            };
        });

        return predictions;
    }

    private getPredictionMessage(
        fuelType: string,
        daysUntilEmpty: number | null,
        avgDailyConsumption: number,
    ): string {
        if (avgDailyConsumption === 0) {
            return `No recent ${fuelType.toLowerCase()} sales data`;
        }
        if (daysUntilEmpty === null) {
            return 'Unable to calculate';
        }
        if (daysUntilEmpty === 0) {
            return `⚠️ ${fuelType} will run out TODAY!`;
        }
        if (daysUntilEmpty === 1) {
            return `⚠️ ${fuelType} will run out TOMORROW!`;
        }
        if (daysUntilEmpty <= 3) {
            return `🔶 ${fuelType} will run out in ${daysUntilEmpty} days`;
        }
        return `✅ ${fuelType} has ~${daysUntilEmpty} days remaining`;
    }

    // Get fuel deliveries
    async getDeliveries(take = 10) {
        return this.prisma.fuelDelivery.findMany({
            take,
            orderBy: { deliveryDate: 'desc' },
            include: {
                receivedBy: {
                    select: { fullName: true },
                },
            },
        });
    }

    // Create low fuel alert
    private async createLowFuelAlert(
        fuelType: string,
        currentLevel: number,
        percentageFull: number,
    ) {
        const alert = await this.prisma.alert.create({
            data: {
                alertType: 'LOW_FUEL',
                severity: percentageFull < 15 ? 'CRITICAL' : 'WARNING',
                message: `${fuelType} tank at ${percentageFull.toFixed(1)}% (${currentLevel.toFixed(0)}L remaining)`,
            },
        });

        this.gateway.emitAlert({
            id: alert.id,
            type: alert.alertType,
            severity: alert.severity,
            message: alert.message,
            timestamp: alert.createdAt,
        });

        return alert;
    }

    // Initialize tanks if they don't exist
    async initializeTanks() {
        const tanksExist = await this.prisma.fuelTank.count();

        if (tanksExist === 0) {
            await this.prisma.fuelTank.createMany({
                data: [
                    {
                        fuelType: 'PETROL',
                        capacity: 12000,
                        currentLevel: 0, // Start empty - admin adds fuel via deliveries
                        minThreshold: 1000,
                    },
                    {
                        fuelType: 'DIESEL',
                        capacity: 10000,
                        currentLevel: 0, // Start empty - admin adds fuel via deliveries
                        minThreshold: 800,
                    },
                ],
            });
            console.log('Fuel tanks initialized (empty)');
        }
    }
}
