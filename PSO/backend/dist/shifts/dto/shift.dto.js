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
exports.EndShiftDto = exports.StartShiftDto = exports.ShiftType = void 0;
const class_validator_1 = require("class-validator");
var ShiftType;
(function (ShiftType) {
    ShiftType["MORNING"] = "MORNING";
    ShiftType["EVENING"] = "EVENING";
    ShiftType["NIGHT"] = "NIGHT";
})(ShiftType || (exports.ShiftType = ShiftType = {}));
class StartShiftDto {
    shiftType;
    openingCash;
    openingPetrolLevel;
    openingDieselLevel;
}
exports.StartShiftDto = StartShiftDto;
__decorate([
    (0, class_validator_1.IsEnum)(ShiftType),
    __metadata("design:type", String)
], StartShiftDto.prototype, "shiftType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], StartShiftDto.prototype, "openingCash", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], StartShiftDto.prototype, "openingPetrolLevel", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], StartShiftDto.prototype, "openingDieselLevel", void 0);
class EndShiftDto {
    closingCash;
    closingPetrolLevel;
    closingDieselLevel;
    notes;
}
exports.EndShiftDto = EndShiftDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EndShiftDto.prototype, "closingCash", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EndShiftDto.prototype, "closingPetrolLevel", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EndShiftDto.prototype, "closingDieselLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EndShiftDto.prototype, "notes", void 0);
//# sourceMappingURL=shift.dto.js.map