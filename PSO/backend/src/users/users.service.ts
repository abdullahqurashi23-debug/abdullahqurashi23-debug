import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpdateUserStatusDto, UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // Get all users (admin only)
    async findAll(role?: string) {
        const where = role ? { role: role as any } : {};

        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
                phone: true,
                status: true,
                createdAt: true,
                lastLogin: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Get all operators (for admin to manage)
    async getOperators() {
        return this.prisma.user.findMany({
            where: { role: 'OPERATOR' },
            select: {
                id: true,
                username: true,
                fullName: true,
                phone: true,
                cnic: true,
                status: true,
                createdAt: true,
                lastLogin: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Get pending operators (awaiting approval)
    async getPendingOperators() {
        return this.prisma.user.findMany({
            where: {
                role: 'OPERATOR',
                status: 'PENDING',
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                phone: true,
                cnic: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Approve operator (admin only)
    async approveOperator(operatorId: string) {
        const operator = await this.prisma.user.findUnique({
            where: { id: operatorId },
        });

        if (!operator) {
            throw new NotFoundException('Operator not found');
        }

        if (operator.role !== 'OPERATOR') {
            throw new BadRequestException('User is not an operator');
        }

        if (operator.status === 'ACTIVE') {
            throw new BadRequestException('Operator already approved');
        }

        return this.prisma.user.update({
            where: { id: operatorId },
            data: { status: 'ACTIVE' },
            select: {
                id: true,
                username: true,
                fullName: true,
                status: true,
            },
        });
    }

    // Suspend operator (admin only)
    async suspendOperator(operatorId: string) {
        const operator = await this.prisma.user.findUnique({
            where: { id: operatorId },
        });

        if (!operator) {
            throw new NotFoundException('Operator not found');
        }

        if (operator.role !== 'OPERATOR') {
            throw new BadRequestException('User is not an operator');
        }

        return this.prisma.user.update({
            where: { id: operatorId },
            data: { status: 'SUSPENDED' },
            select: {
                id: true,
                username: true,
                fullName: true,
                status: true,
            },
        });
    }

    // Update user status
    async updateStatus(userId: string, updateDto: UpdateUserStatusDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { status: updateDto.status as any },
            select: {
                id: true,
                username: true,
                fullName: true,
                status: true,
            },
        });
    }

    // Update user profile
    async updateProfile(userId: string, updateDto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: updateDto,
            select: {
                id: true,
                username: true,
                fullName: true,
                phone: true,
            },
        });
    }

    // Get active operators (for dashboard)
    async getActiveOperatorsCount() {
        return this.prisma.user.count({
            where: {
                role: 'OPERATOR',
                status: 'ACTIVE',
            },
        });
    }

    // Delete operator (admin only)
    async deleteOperator(operatorId: string) {
        const operator = await this.prisma.user.findUnique({
            where: { id: operatorId },
        });

        if (!operator) {
            throw new NotFoundException('Operator not found');
        }

        if (operator.role !== 'OPERATOR') {
            throw new BadRequestException('Cannot delete admin users');
        }

        // Check if operator has any shifts/sales
        const hasShifts = await this.prisma.shift.findFirst({
            where: { operatorId },
        });

        if (hasShifts) {
            throw new BadRequestException('Cannot delete operator with shift history. Suspend instead.');
        }

        await this.prisma.user.delete({
            where: { id: operatorId },
        });

        return { message: 'Operator deleted successfully' };
    }
}
