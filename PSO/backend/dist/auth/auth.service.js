"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_1 = require("../prisma");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const { username, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === 'PENDING') {
            throw new common_1.UnauthorizedException('Account pending approval. Please contact admin.');
        }
        if (user.status === 'SUSPENDED') {
            throw new common_1.UnauthorizedException('Account suspended. Please contact admin.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
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
    async register(registerDto, createdById) {
        const { username, password, fullName, role, phone, cnic } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Username already exists');
        }
        if (cnic) {
            const existingCnic = await this.prisma.user.findUnique({
                where: { cnic },
            });
            if (existingCnic) {
                throw new common_1.ConflictException('CNIC already registered');
            }
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: {
                username,
                passwordHash,
                fullName,
                role,
                phone,
                cnic,
                status: role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
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
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return this.generateTokens(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getProfile(userId) {
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
            throw new common_1.BadRequestException('User not found');
        }
        return user;
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET') || 'default-secret',
            expiresIn: 900,
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
            expiresIn: 604800,
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async seedDefaultAdmin() {
        const adminExists = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });
        if (!adminExists) {
            const defaultUsername = this.configService.get('DEFAULT_ADMIN_USERNAME') || 'admin';
            const defaultPassword = this.configService.get('DEFAULT_ADMIN_PASSWORD') || 'admin123';
            await this.register({
                username: defaultUsername,
                password: defaultPassword,
                fullName: 'System Administrator',
                role: 'ADMIN',
            });
            console.log('Default admin account created:', defaultUsername);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map