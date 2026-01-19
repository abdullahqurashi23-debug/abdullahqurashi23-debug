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
exports.ShiftsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const pump_gateway_1 = require("../gateway/pump.gateway");
let ShiftsService = class ShiftsService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async startShift(operatorId, startDto) {
        const activeShift = await this.prisma.shift.findFirst({
            where: {
                operatorId,
                status: 'ACTIVE',
            },
        });
        if (activeShift) {
            throw new common_1.BadRequestException('You already have an active shift. Please end your current shift first.');
        }
        const shift = await this.prisma.shift.create({
            data: {
                operatorId,
                shiftType: startDto.shiftType,
                startTime: new Date(),
                openingCash: startDto.openingCash,
                openingPetrolLevel: startDto.openingPetrolLevel,
                openingDieselLevel: startDto.openingDieselLevel,
                status: 'ACTIVE',
            },
            include: {
                operator: { select: { fullName: true } },
            },
        });
        this.gateway.emitShiftUpdate({
            operatorId,
            operatorName: shift.operator.fullName,
            shiftId: shift.id,
            totalSales: 0,
            totalLiters: 0,
            status: 'ACTIVE',
        });
        return {
            message: 'Shift started successfully',
            shift: {
                id: shift.id,
                shiftType: shift.shiftType,
                startTime: shift.startTime,
                openingCash: Number(shift.openingCash),
                openingPetrolLevel: Number(shift.openingPetrolLevel),
                openingDieselLevel: Number(shift.openingDieselLevel),
            },
        };
    }
    async endShift(operatorId, shiftId, endDto) {
        const shift = await this.prisma.shift.findUnique({
            where: { id: shiftId },
            include: { operator: { select: { fullName: true } } },
        });
        if (!shift) {
            throw new common_1.NotFoundException('Shift not found');
        }
        if (shift.operatorId !== operatorId) {
            throw new common_1.BadRequestException('This shift does not belong to you');
        }
        if (shift.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Shift is already closed');
        }
        const expectedCash = Number(shift.openingCash) + Number(shift.cashCollected);
        const cashVariance = endDto.closingCash - expectedCash;
        const expectedPetrol = Number(shift.openingPetrolLevel) -
            (await this.getShiftFuelSold(shiftId, 'PETROL'));
        const expectedDiesel = Number(shift.openingDieselLevel) -
            (await this.getShiftFuelSold(shiftId, 'DIESEL'));
        const petrolVariance = endDto.closingPetrolLevel - expectedPetrol;
        const dieselVariance = endDto.closingDieselLevel - expectedDiesel;
        const fuelVariance = petrolVariance + dieselVariance;
        const updatedShift = await this.prisma.shift.update({
            where: { id: shiftId },
            data: {
                endTime: new Date(),
                closingCash: endDto.closingCash,
                closingPetrolLevel: endDto.closingPetrolLevel,
                closingDieselLevel: endDto.closingDieselLevel,
                cashVariance,
                fuelVariance,
                notes: endDto.notes,
                status: 'CLOSED',
            },
        });
        this.gateway.emitShiftUpdate({
            operatorId,
            operatorName: shift.operator.fullName,
            shiftId: shift.id,
            totalSales: Number(updatedShift.totalSales),
            totalLiters: Number(updatedShift.totalLiters),
            status: 'CLOSED',
        });
        if (Math.abs(cashVariance) > 100) {
            this.gateway.emitAlert({
                id: shiftId,
                type: 'CASH_VARIANCE',
                severity: Math.abs(cashVariance) > 500 ? 'CRITICAL' : 'WARNING',
                message: `Cash ${cashVariance < 0 ? 'shortage' : 'excess'} of Rs ${Math.abs(cashVariance).toFixed(0)} in ${shift.operator.fullName}'s shift`,
                timestamp: new Date(),
            });
        }
        return {
            message: 'Shift ended successfully',
            summary: {
                shiftId: updatedShift.id,
                shiftType: updatedShift.shiftType,
                duration: this.calculateDuration(shift.startTime, updatedShift.endTime),
                totalSales: Number(updatedShift.totalSales),
                totalLiters: Number(updatedShift.totalLiters),
                cashCollected: Number(updatedShift.cashCollected),
                cardPayments: Number(updatedShift.cardPayments),
                creditSales: Number(updatedShift.creditSales),
                cashVariance,
                fuelVariance,
            },
        };
    }
    async getActiveShift(operatorId) {
        const shift = await this.prisma.shift.findFirst({
            where: {
                operatorId,
                status: 'ACTIVE',
            },
            include: {
                sales: {
                    orderBy: { saleDate: 'desc' },
                    take: 10,
                },
            },
        });
        if (!shift) {
            return null;
        }
        return {
            ...shift,
            totalSales: Number(shift.totalSales),
            totalLiters: Number(shift.totalLiters),
            cashCollected: Number(shift.cashCollected),
            openingCash: Number(shift.openingCash),
        };
    }
    async getAllActiveShifts() {
        const shifts = await this.prisma.shift.findMany({
            where: { status: 'ACTIVE' },
            include: {
                operator: { select: { id: true, fullName: true, username: true } },
            },
            orderBy: { startTime: 'desc' },
        });
        return shifts.map((shift) => ({
            id: shift.id,
            operator: shift.operator,
            shiftType: shift.shiftType,
            startTime: shift.startTime,
            totalSales: Number(shift.totalSales),
            totalLiters: Number(shift.totalLiters),
            duration: this.calculateDuration(shift.startTime, new Date()),
            status: 'ACTIVE',
        }));
    }
    async getDailyShifts() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const shifts = await this.prisma.shift.findMany({
            where: {
                startTime: {
                    gte: today,
                },
            },
            include: {
                operator: { select: { id: true, fullName: true, username: true } },
            },
            orderBy: { startTime: 'desc' },
        });
        return shifts.map((shift) => ({
            id: shift.id,
            operator: shift.operator,
            shiftType: shift.shiftType,
            startTime: shift.startTime,
            endTime: shift.endTime,
            status: shift.status,
            totalSales: Number(shift.totalSales),
            totalLiters: Number(shift.totalLiters),
            cashCollected: Number(shift.cashCollected),
            cardPayments: Number(shift.cardPayments),
            creditSales: Number(shift.creditSales),
            duration: this.calculateDuration(shift.startTime, shift.endTime || new Date()),
        }));
    }
    async getOperatorShiftHistory(operatorId, take = 10) {
        return this.prisma.shift.findMany({
            where: { operatorId },
            orderBy: { startTime: 'desc' },
            take,
            select: {
                id: true,
                shiftType: true,
                startTime: true,
                endTime: true,
                totalSales: true,
                totalLiters: true,
                status: true,
            },
        });
    }
    async getShiftDetails(shiftId) {
        const shift = await this.prisma.shift.findUnique({
            where: { id: shiftId },
            include: {
                operator: { select: { fullName: true, username: true } },
                sales: {
                    orderBy: { saleDate: 'desc' },
                },
            },
        });
        if (!shift) {
            throw new common_1.NotFoundException('Shift not found');
        }
        return shift;
    }
    async getShiftFuelSold(shiftId, fuelType) {
        const result = await this.prisma.sale.aggregate({
            where: {
                shiftId,
                fuelType: fuelType,
            },
            _sum: { liters: true },
        });
        return Number(result._sum.liters) || 0;
    }
    calculateDuration(start, end) {
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
};
exports.ShiftsService = ShiftsService;
exports.ShiftsService = ShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        pump_gateway_1.PumpGateway])
], ShiftsService);
//# sourceMappingURL=shifts.service.js.map