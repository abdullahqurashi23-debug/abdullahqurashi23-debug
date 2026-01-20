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
exports.TanksController = void 0;
const common_1 = require("@nestjs/common");
const tanks_service_1 = require("./tanks.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../common/decorators");
let TanksController = class TanksController {
    tanksService;
    constructor(tanksService) {
        this.tanksService = tanksService;
    }
    async findAll() {
        return this.tanksService.findAll();
    }
    async getStats() {
        return this.tanksService.getStats();
    }
    async getPredictions() {
        return this.tanksService.getPredictions();
    }
    async getDeliveries(take) {
        return this.tanksService.getDeliveries(take ? parseInt(take) : 10);
    }
    async findByType(fuelType) {
        return this.tanksService.findByType(fuelType);
    }
    async setTankLevel(fuelType, data) {
        return this.tanksService.setLevel(fuelType, data.currentLevel);
    }
    async recordDelivery(data, user) {
        return this.tanksService.recordDelivery({
            ...data,
            receivedById: user.id,
        });
    }
};
exports.TanksController = TanksController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TanksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TanksController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('predictions'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    (0, decorators_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TanksController.prototype, "getPredictions", null);
__decorate([
    (0, common_1.Get)('deliveries'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    (0, decorators_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TanksController.prototype, "getDeliveries", null);
__decorate([
    (0, common_1.Get)(':fuelType'),
    __param(0, (0, common_1.Param)('fuelType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TanksController.prototype, "findByType", null);
__decorate([
    (0, common_1.Patch)(':fuelType/level'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    (0, decorators_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('fuelType')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TanksController.prototype, "setTankLevel", null);
__decorate([
    (0, common_1.Post)('delivery'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    (0, decorators_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TanksController.prototype, "recordDelivery", null);
exports.TanksController = TanksController = __decorate([
    (0, common_1.Controller)('tanks'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tanks_service_1.TanksService])
], TanksController);
//# sourceMappingURL=tanks.controller.js.map