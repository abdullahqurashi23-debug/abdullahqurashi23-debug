import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    createMessage(body: {
        senderId: string;
        receiverId: string;
        content: string;
    }): Promise<{
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
    getConversation(userId1: string, userId2: string): Promise<({
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
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        readAt: Date | null;
        content: string;
        isRead: boolean;
        senderId: string;
        receiverId: string;
    }>;
}
