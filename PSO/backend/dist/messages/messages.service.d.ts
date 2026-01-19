import { PrismaService } from '../prisma';
import { PumpGateway } from '../gateway/pump.gateway';
export declare class MessagesService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: PumpGateway);
    createMessage(senderId: string, receiverId: string, content: string): Promise<{
        sender: {
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        readAt: Date | null;
        content: string;
        isRead: boolean;
        senderId: string;
        receiverId: string;
    }>;
    getMessages(userId1: string, userId2: string): Promise<({
        sender: {
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        readAt: Date | null;
        content: string;
        isRead: boolean;
        senderId: string;
        receiverId: string;
    })[]>;
    getUserMessages(userId: string): Promise<({
        sender: {
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
        };
        receiver: {
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        readAt: Date | null;
        content: string;
        isRead: boolean;
        senderId: string;
        receiverId: string;
    })[]>;
    markAsRead(messageId: string): Promise<{
        id: string;
        createdAt: Date;
        readAt: Date | null;
        content: string;
        isRead: boolean;
        senderId: string;
        receiverId: string;
    }>;
}
