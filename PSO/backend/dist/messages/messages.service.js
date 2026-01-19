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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("../prisma");
const pump_gateway_1 = require("../gateway/pump.gateway");
let MessagesService = class MessagesService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async createMessage(senderId, receiverId, content) {
        const message = await this.prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
        });
        const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
        if (receiver) {
            if (receiver.role === 'OPERATOR') {
                this.gateway.emitToOperator(receiverId, 'message:new', message);
            }
            else if (receiver.role === 'ADMIN') {
                this.gateway.server.to('admins').emit('message:new', message);
            }
        }
        return message;
    }
    async getMessages(userId1, userId2) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                }
            }
        });
    }
    async getUserMessages(userId) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { receiverId: userId },
                    { senderId: userId }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                }
            }
        });
    }
    async markAsRead(messageId) {
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        pump_gateway_1.PumpGateway])
], MessagesService);
//# sourceMappingURL=messages.service.js.map