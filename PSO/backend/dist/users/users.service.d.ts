import { PrismaService } from '../prisma';
import { UpdateUserStatusDto, UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(role?: string): Promise<{
        username: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        lastLogin: Date | null;
    }[]>;
    getOperators(): Promise<{
        username: string;
        fullName: string;
        phone: string | null;
        cnic: string | null;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        lastLogin: Date | null;
    }[]>;
    getPendingOperators(): Promise<{
        username: string;
        fullName: string;
        phone: string | null;
        cnic: string | null;
        id: string;
        createdAt: Date;
    }[]>;
    approveOperator(operatorId: string): Promise<{
        username: string;
        fullName: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    suspendOperator(operatorId: string): Promise<{
        username: string;
        fullName: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateStatus(userId: string, updateDto: UpdateUserStatusDto): Promise<{
        username: string;
        fullName: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateProfile(userId: string, updateDto: UpdateUserDto): Promise<{
        username: string;
        fullName: string;
        phone: string | null;
        id: string;
    }>;
    getActiveOperatorsCount(): Promise<number>;
    deleteOperator(operatorId: string): Promise<{
        message: string;
    }>;
}
