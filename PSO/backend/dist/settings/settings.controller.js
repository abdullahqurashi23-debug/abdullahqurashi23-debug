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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../common/decorators");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsController = class SettingsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPumpInfo() {
        const settings = await this.prisma.setting.findMany({
            where: {
                key: {
                    in: ['pump_name', 'pump_address', 'pump_phone', 'pump_tax_rate']
                }
            }
        });
        const result = {
            name: 'Al-Rehman Filling',
            address: 'N-25 Chakwal Road, Balkasar',
            phone: '0345-1234567',
            taxRate: '17',
        };
        settings.forEach(s => {
            if (s.key === 'pump_name')
                result.name = s.value;
            if (s.key === 'pump_address')
                result.address = s.value;
            if (s.key === 'pump_phone')
                result.phone = s.value;
            if (s.key === 'pump_tax_rate')
                result.taxRate = s.value;
        });
        return result;
    }
    async updatePumpInfo(dto, user) {
        const updates = [
            { key: 'pump_name', value: dto.name },
            { key: 'pump_address', value: dto.address },
            { key: 'pump_phone', value: dto.phone },
            { key: 'pump_tax_rate', value: dto.taxRate },
        ];
        for (const { key, value } of updates) {
            await this.prisma.setting.upsert({
                where: { key },
                update: { value, updatedAt: new Date(), updatedById: user.id },
                create: { key, value, updatedById: user.id },
            });
        }
        return { success: true, message: 'Pump info updated successfully' };
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('pump-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getPumpInfo", null);
__decorate([
    (0, common_1.Put)('pump-info'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    (0, decorators_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updatePumpInfo", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map