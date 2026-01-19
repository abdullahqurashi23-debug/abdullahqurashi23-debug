import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
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
    register(registerDto: RegisterDto, createdById?: string): Promise<{
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
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(userId: string): Promise<{
        username: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        lastLogin: Date | null;
    }>;
    private generateTokens;
    seedDefaultAdmin(): Promise<void>;
}
