import { UsersService } from './users.service';
import { UpdateUserStatusDto, UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    approveOperator(id: string): Promise<{
        username: string;
        fullName: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    suspendOperator(id: string): Promise<{
        username: string;
        fullName: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateStatus(id: string, updateDto: UpdateUserStatusDto): Promise<{
        username: string;
        fullName: string;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateProfile(id: string, updateDto: UpdateUserDto): Promise<{
        username: string;
        fullName: string;
        phone: string | null;
        id: string;
    }>;
    deleteOperator(id: string): Promise<{
        message: string;
    }>;
}
