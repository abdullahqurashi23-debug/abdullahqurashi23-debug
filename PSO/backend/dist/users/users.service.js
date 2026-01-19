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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(role) {
        const where = role ? { role: role } : {};
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
    async approveOperator(operatorId) {
        const operator = await this.prisma.user.findUnique({
            where: { id: operatorId },
        });
        if (!operator) {
            throw new common_1.NotFoundException('Operator not found');
        }
        if (operator.role !== 'OPERATOR') {
            throw new common_1.BadRequestException('User is not an operator');
        }
        if (operator.status === 'ACTIVE') {
            throw new common_1.BadRequestException('Operator already approved');
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
    async suspendOperator(operatorId) {
        const operator = await this.prisma.user.findUnique({
            where: { id: operatorId },
        });
        if (!operator) {
            throw new common_1.NotFoundException('Operator not found');
        }
        if (operator.role !== 'OPERATOR') {
            throw new common_1.BadRequestException('User is not an operator');
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
    async updateStatus(userId, updateDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { status: updateDto.status },
            select: {
                id: true,
                username: true,
                fullName: true,
                status: true,
            },
        });
    }
    async updateProfile(userId, updateDto) {
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
    async getActiveOperatorsCount() {
        return this.prisma.user.count({
            where: {
                role: 'OPERATOR',
                status: 'ACTIVE',
            },
        });
    }
    async deleteOperator(operatorId) {
        const operator = await this.prisma.user.findUnique({
            where: { id: operatorId },
        });
        if (!operator) {
            throw new common_1.NotFoundException('Operator not found');
        }
        if (operator.role !== 'OPERATOR') {
            throw new common_1.BadRequestException('Cannot delete admin users');
        }
        const hasShifts = await this.prisma.shift.findFirst({
            where: { operatorId },
        });
        if (hasShifts) {
            throw new common_1.BadRequestException('Cannot delete operator with shift history. Suspend instead.');
        }
        await this.prisma.user.delete({
            where: { id: operatorId },
        });
        return { message: 'Operator deleted successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map