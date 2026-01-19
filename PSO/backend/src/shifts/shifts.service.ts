import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PumpGateway } from '../gateway/pump.gateway';
import { StartShiftDto, EndShiftDto } from './dto/shift.dto';

@Injectable()
export class ShiftsService {
    constructor(
        private prisma: PrismaService,
        private gateway: PumpGateway,
    ) { }

    // Start a new shift
    async startShift(operatorId: string, startDto: StartShiftDto) {
        // Check if operator already has an active shift
        const activeShift = await this.prisma.shift.findFirst({
            where: {
                operatorId,
                status: 'ACTIVE',
            },
        });

        if (activeShift) {
            throw new BadRequestException(
                'You already have an active shift. Please end your current shift first.',
            );
        }

        // Create new shift
        const shift = await this.prisma.shift.create({
            data: {
                operatorId,
                shiftType: startDto.shiftType as any,
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

        // Emit shift started event
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

    // End the current shift
    async endShift(operatorId: string, shiftId: string, endDto: EndShiftDto) {
        const shift = await this.prisma.shift.findUnique({
            where: { id: shiftId },
            include: { operator: { select: { fullName: true } } },
        });

        if (!shift) {
            throw new NotFoundException('Shift not found');
        }

        if (shift.operatorId !== operatorId) {
            throw new BadRequestException('This shift does not belong to you');
        }

        if (shift.status !== 'ACTIVE') {
            throw new BadRequestException('Shift is already closed');
        }

        // Calculate variances
        const expectedCash = Number(shift.openingCash) + Number(shift.cashCollected);
        const cashVariance = endDto.closingCash - expectedCash;

        const expectedPetrol = Number(shift.openingPetrolLevel) -
            (await this.getShiftFuelSold(shiftId, 'PETROL'));
        const expectedDiesel = Number(shift.openingDieselLevel) -
            (await this.getShiftFuelSold(shiftId, 'DIESEL'));

        const petrolVariance = endDto.closingPetrolLevel - expectedPetrol;
        const dieselVariance = endDto.closingDieselLevel - expectedDiesel;
        const fuelVariance = petrolVariance + dieselVariance;

        // Update shift
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

        // Emit shift ended event
        this.gateway.emitShiftUpdate({
            operatorId,
            operatorName: shift.operator.fullName,
            shiftId: shift.id,
            totalSales: Number(updatedShift.totalSales),
            totalLiters: Number(updatedShift.totalLiters),
            status: 'CLOSED',
        });

        // Alert if there's significant variance
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
                duration: this.calculateDuration(shift.startTime, updatedShift.endTime!),
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

    // Get active shift for operator
    async getActiveShift(operatorId: string) {
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

    // Get all active shifts (for admin dashboard)
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

    // Get all shifts for today (Active + Closed)
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

    // Get shift history for operator
    async getOperatorShiftHistory(operatorId: string, take = 10) {
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

    // Get shift details with sales
    async getShiftDetails(shiftId: string) {
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
            throw new NotFoundException('Shift not found');
        }

        return shift;
    }

    // Helper: Get fuel sold in a shift by type
    private async getShiftFuelSold(shiftId: string, fuelType: string): Promise<number> {
        const result = await this.prisma.sale.aggregate({
            where: {
                shiftId,
                fuelType: fuelType as any,
            },
            _sum: { liters: true },
        });

        return Number(result._sum.liters) || 0;
    }

    // Helper: Calculate duration string
    private calculateDuration(start: Date, end: Date): string {
        const diffMs = end.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
}
