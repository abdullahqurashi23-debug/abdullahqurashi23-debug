import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active (operators need approval)
        if (user.status === 'PENDING') {
            throw new UnauthorizedException('Account pending approval. Please contact admin.');
        }

        if (user.status === 'SUSPENDED') {
            throw new UnauthorizedException('Account suspended. Please contact admin.');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user);

        return {
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
            },
            ...tokens,
        };
    }

    async register(registerDto: RegisterDto, createdById?: string) {
        const { username, password, fullName, role, phone, cnic } = registerDto;

        // Check if username exists
        const existingUser = await this.prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        // Check if CNIC exists
        if (cnic) {
            const existingCnic = await this.prisma.user.findUnique({
                where: { cnic },
            });
            if (existingCnic) {
                throw new ConflictException('CNIC already registered');
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                username,
                passwordHash,
                fullName,
                role,
                phone,
                cnic,
                status: role === 'ADMIN' ? 'ACTIVE' : 'PENDING', // Operators need approval
                createdById,
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        return {
            message: role === 'ADMIN'
                ? 'Admin account created successfully'
                : 'Operator account created. Pending admin approval.',
            user,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || user.status !== 'ACTIVE') {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.generateTokens(user);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
                phone: true,
                status: true,
                createdAt: true,
                lastLogin: true,
            },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return user;
    }

    private async generateTokens(user: { id: string; username: string; role: string }) {
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
            expiresIn: 900, // 15 minutes
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
            expiresIn: 604800, // 7 days
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    // Seed default admin if none exists
    async seedDefaultAdmin() {
        const adminExists = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });

        if (!adminExists) {
            const defaultUsername = this.configService.get<string>('DEFAULT_ADMIN_USERNAME') || 'admin';
            const defaultPassword = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD') || 'admin123';

            await this.register({
                username: defaultUsername,
                password: defaultPassword,
                fullName: 'System Administrator',
                role: 'ADMIN' as any,
            });

            console.log('Default admin account created:', defaultUsername);
        }
    }
}
