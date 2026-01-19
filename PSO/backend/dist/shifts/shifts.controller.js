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
exports.ShiftsController = void 0;
const common_1 = require("@nestjs/common");
const shifts_service_1 = require("./shifts.service");
const shift_dto_1 = require("./dto/shift.dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../common/decorators");
let ShiftsController = class ShiftsController {
    shiftsService;
    constructor(shiftsService) {
        this.shiftsService = shiftsService;
    }
    async startShift(startDto, user) {
        return this.shiftsService.startShift(user.id, startDto);
    }
    async endShift(shiftId, endDto, user) {
        return this.shiftsService.endShift(user.id, shiftId, endDto);
    }
    async getActiveShift(user) {
        return this.shiftsService.getActiveShift(user.id);
    }
    async getAllActiveShifts() {
        return this.shiftsService.getAllActiveShifts();
    }
    async getDailyShifts() {
        return this.shiftsService.getDailyShifts();
    }
    async getMyShiftHistory(user, take) {
        return this.shiftsService.getOperatorShiftHistory(user.id, take ? parseInt(take) : 10);
    }
    async getShiftDetails(shiftId) {
        return this.shiftsService.getShiftDetails(shiftId);
    }
};
exports.ShiftsController = ShiftsController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_dto_1.StartShiftDto, Object]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "startShift", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_dto_1.EndShiftDto, Object]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "endShift", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "getActiveShift", null);
__decorate([
    (0, common_1.Get)('active/all'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    (0, decorators_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "getAllActiveShifts", null);
__decorate([
    (0, common_1.Get)('daily'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    (0, decorators_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "getDailyShifts", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "getMyShiftHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "getShiftDetails", null);
exports.ShiftsController = ShiftsController = __decorate([
    (0, common_1.Controller)('shifts'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [shifts_service_1.ShiftsService])
], ShiftsController);
//# sourceMappingURL=shifts.controller.js.map