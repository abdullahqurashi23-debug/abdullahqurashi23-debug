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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_1 = require("./prisma");
const auth_module_1 = require("./auth/auth.module");
const auth_service_1 = require("./auth/auth.service");
const users_module_1 = require("./users/users.module");
const shifts_module_1 = require("./shifts/shifts.module");
const sales_module_1 = require("./sales/sales.module");
const tanks_module_1 = require("./tanks/tanks.module");
const tanks_service_1 = require("./tanks/tanks.service");
const gateway_module_1 = require("./gateway/gateway.module");
const banking_module_1 = require("./banking/banking.module");
const messages_module_1 = require("./messages/messages.module");
let AppModule = class AppModule {
    authService;
    tanksService;
    constructor(authService, tanksService) {
        this.authService = authService;
        this.tanksService = tanksService;
    }
    async onModuleInit() {
        await this.authService.seedDefaultAdmin();
        await this.tanksService.initializeTanks();
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_1.PrismaModule,
            gateway_module_1.GatewayModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            shifts_module_1.ShiftsModule,
            sales_module_1.SalesModule,
            tanks_module_1.TanksModule,
            banking_module_1.BankingModule,
            messages_module_1.MessagesModule,
        ],
    }),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        tanks_service_1.TanksService])
], AppModule);
//# sourceMappingURL=app.module.js.map