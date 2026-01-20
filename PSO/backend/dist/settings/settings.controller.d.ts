import { PrismaService } from '../prisma/prisma.service';
interface AuthUser {
    id: string;
    role: string;
}
interface PumpInfoDto {
    name: string;
    address: string;
    phone: string;
    taxRate: string;
}
export declare class SettingsController {
    private prisma;
    constructor(prisma: PrismaService);
    getPumpInfo(): Promise<Record<string, string>>;
    updatePumpInfo(dto: PumpInfoDto, user: AuthUser): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
