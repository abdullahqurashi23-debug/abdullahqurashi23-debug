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
exports.TanksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const pump_gateway_1 = require("../gateway/pump.gateway");
let TanksService = class TanksService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async findAll() {
        return this.prisma.fuelTank.findMany({
            orderBy: { fuelType: 'asc' },
        });
    }
    async findByType(fuelType) {
        const tank = await this.prisma.fuelTank.findUnique({
            where: { fuelType },
        });
        if (!tank) {
            throw new common_1.NotFoundException(`${fuelType} tank not found`);
        }
        return tank;
    }
    async updateLevel(fuelType, litersChange) {
        const tank = await this.findByType(fuelType);
        const previousLevel = Number(tank.currentLevel);
        const newLevel = previousLevel + litersChange;
        const finalLevel = Math.max(0, newLevel);
        const updated = await this.prisma.fuelTank.update({
            where: { fuelType },
            data: {
                currentLevel: finalLevel,
                lastUpdated: new Date(),
            },
        });
        const capacity = Number(tank.capacity);
        const percentageFull = (finalLevel / capacity) * 100;
        this.gateway.emitTankUpdate({
            fuelType,
            previousLevel,
            currentLevel: finalLevel,
            capacity,
            percentageFull,
        });
        if (finalLevel <= Number(tank.minThreshold)) {
            await this.createLowFuelAlert(fuelType, finalLevel, percentageFull);
        }
        return updated;
    }
    async setLevel(fuelType, newLevel) {
        const tank = await this.findByType(fuelType);
        const previousLevel = Number(tank.currentLevel);
        const capacity = Number(tank.capacity);
        const finalLevel = Math.max(0, Math.min(newLevel, capacity));
        const updated = await this.prisma.fuelTank.update({
            where: { fuelType },
            data: {
                currentLevel: finalLevel,
                lastUpdated: new Date(),
            },
        });
        const percentageFull = (finalLevel / capacity) * 100;
        this.gateway.emitTankUpdate({
            fuelType,
            previousLevel,
            currentLevel: finalLevel,
            capacity,
            percentageFull,
        });
        if (finalLevel <= Number(tank.minThreshold)) {
            await this.createLowFuelAlert(fuelType, finalLevel, percentageFull);
        }
        return updated;
    }
    async recordDelivery(data) {
        const tank = await this.findByType(data.fuelType);
        const tankLevelBefore = Number(tank.currentLevel);
        const tankLevelAfter = tankLevelBefore + data.quantityLiters;
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
        await this.prisma.fuelTank.update({
            where: { fuelType: data.fuelType },
            data: {
                currentLevel: tankLevelAfter,
                lastRefillDate: new Date(),
                lastUpdated: new Date(),
            },
        });
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
    async getStats() {
        const tanks = await this.findAll();
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
            const pricePerLiter = fuelPrices[tank.fuelType] || 0;
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
    async createLowFuelAlert(fuelType, currentLevel, percentageFull) {
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
    async initializeTanks() {
        const tanksExist = await this.prisma.fuelTank.count();
        if (tanksExist === 0) {
            await this.prisma.fuelTank.createMany({
                data: [
                    {
                        fuelType: 'PETROL',
                        capacity: 12000,
                        currentLevel: 0,
                        minThreshold: 1000,
                    },
                    {
                        fuelType: 'DIESEL',
                        capacity: 10000,
                        currentLevel: 0,
                        minThreshold: 800,
                    },
                ],
            });
            console.log('Fuel tanks initialized (empty)');
        }
    }
};
exports.TanksService = TanksService;
exports.TanksService = TanksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        pump_gateway_1.PumpGateway])
], TanksService);
//# sourceMappingURL=tanks.service.js.map