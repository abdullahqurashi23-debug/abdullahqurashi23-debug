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
exports.PumpGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let PumpGateway = class PumpGateway {
    server;
    logger = new common_1.Logger('PumpGateway');
    connectedUsers = new Map();
    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.connectedUsers.delete(client.id);
        this.broadcastActiveOperators();
    }
    handleRegister(client, data) {
        this.connectedUsers.set(client.id, {
            socketId: client.id,
            userId: data.userId,
            role: data.role,
            username: data.username,
        });
        if (data.role === 'ADMIN') {
            client.join('admins');
        }
        else {
            client.join('operators');
            client.join(`operator:${data.userId}`);
        }
        this.logger.log(`User registered: ${data.username} (${data.role})`);
        this.broadcastActiveOperators();
        return { success: true };
    }
    emitNewSale(sale) {
        this.server.to('admins').emit('sale:new', sale);
        this.logger.log(`New sale emitted: Rs ${sale.amount} by ${sale.operatorName}`);
    }
    emitTankUpdate(data) {
        this.server.emit('tank:update', data);
        this.logger.log(`Tank update: ${data.fuelType} at ${data.percentageFull.toFixed(1)}%`);
    }
    emitShiftUpdate(data) {
        this.server.to('admins').emit('shift:update', data);
    }
    emitToOperator(operatorId, event, data) {
        this.server.to(`operator:${operatorId}`).emit(event, data);
    }
    emitAlert(alert) {
        this.server.to('admins').emit('alert:new', alert);
        this.logger.warn(`Alert: ${alert.message}`);
    }
    emitCreditApproval(operatorId, data) {
        this.server.to(`operator:${operatorId}`).emit('credit:response', data);
    }
    handleCreditRequest(client, data) {
        this.server.to('admins').emit('credit:approval_needed', {
            ...data,
            requestedAt: new Date(),
        });
        return { success: true, message: 'Credit approval request sent' };
    }
    getActiveOperators() {
        return Array.from(this.connectedUsers.values()).filter((user) => user.role === 'OPERATOR');
    }
    broadcastActiveOperators() {
        const activeOperators = this.getActiveOperators();
        this.server.to('admins').emit('operators:active', {
            count: activeOperators.length,
            operators: activeOperators.map((op) => ({
                userId: op.userId,
                username: op.username,
            })),
        });
    }
    isUserConnected(userId) {
        return Array.from(this.connectedUsers.values()).some((user) => user.userId === userId);
    }
    getConnectedUser(userId) {
        return Array.from(this.connectedUsers.values()).find((user) => user.userId === userId);
    }
};
exports.PumpGateway = PumpGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PumpGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('auth:register'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], PumpGateway.prototype, "handleRegister", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('credit:request'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], PumpGateway.prototype, "handleCreditRequest", null);
exports.PumpGateway = PumpGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/pump',
    })
], PumpGateway);
//# sourceMappingURL=pump.gateway.js.map