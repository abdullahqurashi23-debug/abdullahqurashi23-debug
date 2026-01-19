import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    register(registerDto: RegisterDto, user: {
        id: string;
    }): Promise<{
        message: string;
        user: {
            username: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(user: {
        id: string;
    }): Promise<{
        username: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        lastLogin: Date | null;
    }>;
}
