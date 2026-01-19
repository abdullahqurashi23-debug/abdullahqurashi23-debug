
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PumpGateway } from '../gateway/pump.gateway';

@Injectable()
export class MessagesService {
    constructor(
        private prisma: PrismaService,
        private gateway: PumpGateway,
    ) { }

    // Create a new message
    async createMessage(senderId: string, receiverId: string, content: string) {
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

        // Emit real-time event to the receiver
        // Using the emitToOperator method from the gateway if it's an operator
        // Or broadcasting to admins if the receiver is an admin (though logic might need to be specific)

        // For now, let's assume direct targeting via the gateway's generic emit capability or add a specific method
        // The gateway has `emitToOperator`, let's check if we can emit to admins too.
        // The gateway currently joins admins to 'admins' room.

        // Let's optimize: check receiver role.
        const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });

        if (receiver) {
            if (receiver.role === 'OPERATOR') {
                this.gateway.emitToOperator(receiverId, 'message:new', message);
            } else if (receiver.role === 'ADMIN') {
                // We can emit to specific admin if they have a dedicated room (usually by user ID too), 
                // but `pump.gateway.ts` joins `client.join('admins')` and `client.join('operators')` + `operator:${userId}`
                // It doesn't seem to join generic `user:${userId}`. 
                // Let's update gateway later to be more generic if needed, but for now assuming:
                // Admin -> Operator (Operator gets it via `operator:${id}`)
                // Operator -> Admin (Admins get it via `admins` room perhaps? Or we want specific admin?)
                // Usually messages are direct. If Operator sends to Admin, all admins might see it or a specific one.
                // Let's just emit to the user room if possible.
                // NOTE: Current gateway implementation has `join('admins')` for ADMIN and `join('operator:${data.userId}')` for OPERATOR.
                // We'll need to update gateway to allow targeting specific admins if we want 1-on-1, or just broadcast to 'admins'.
                // For now, let's broadcast to 'admins' if receiver is admin.
                this.gateway.server.to('admins').emit('message:new', message);
            }
        }

        return message;
    }

    // Get conversation between two users
    async getMessages(userId1: string, userId2: string) {
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

    // Get generic messages for a user (inbox)
    async getUserMessages(userId: string) {
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

    // Mark message as read
    async markAsRead(messageId: string) {
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
}
