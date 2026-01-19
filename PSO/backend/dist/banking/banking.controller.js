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
exports.BankingController = void 0;
const common_1 = require("@nestjs/common");
const banking_service_1 = require("./banking.service");
const banking_dto_1 = require("./dto/banking.dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../common/decorators");
let BankingController = class BankingController {
    bankingService;
    constructor(bankingService) {
        this.bankingService = bankingService;
    }
    async getCashFlow() {
        return this.bankingService.getTodayCashFlow();
    }
    async getMonthlySummary() {
        return this.bankingService.getMonthlySummary();
    }
    async getTransactions(take, type) {
        return this.bankingService.getTransactions(take ? parseInt(take) : 20, type);
    }
    async recordDeposit(data, user) {
        return this.bankingService.recordDeposit({
            ...data,
            depositedById: user.id,
        });
    }
    async getExpenses(take, category) {
        return this.bankingService.getExpenses(take ? parseInt(take) : 20, category);
    }
    async getExpensesByCategory() {
        return this.bankingService.getExpensesByCategory();
    }
    async recordExpense(data, user) {
        return this.bankingService.recordExpense(data, user.id);
    }
    async getCreditCustomers() {
        return this.bankingService.getCreditCustomers();
    }
    async createCreditCustomer(data, user) {
        return this.bankingService.createCreditCustomer(data);
    }
    async receiveCreditPayment(customerId, amount, user) {
        return this.bankingService.receiveCreditPayment(customerId, amount, user.id);
    }
};
exports.BankingController = BankingController;
__decorate([
    (0, common_1.Get)('cash-flow'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getCashFlow", null);
__decorate([
    (0, common_1.Get)('monthly-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getMonthlySummary", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)('take')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('deposit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "recordDeposit", null);
__decorate([
    (0, common_1.Get)('expenses'),
    __param(0, (0, common_1.Query)('take')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getExpenses", null);
__decorate([
    (0, common_1.Get)('expenses/by-category'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getExpensesByCategory", null);
__decorate([
    (0, common_1.Post)('expenses'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [banking_dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "recordExpense", null);
__decorate([
    (0, common_1.Get)('credit-customers'),
    (0, decorators_1.Roles)('ADMIN', 'OPERATOR'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getCreditCustomers", null);
__decorate([
    (0, common_1.Post)('credit-customers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "createCreditCustomer", null);
__decorate([
    (0, common_1.Post)('credit-customers/:id/payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "receiveCreditPayment", null);
exports.BankingController = BankingController = __decorate([
    (0, common_1.Controller)('banking'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, decorators_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [banking_service_1.BankingService])
], BankingController);
//# sourceMappingURL=banking.controller.js.map