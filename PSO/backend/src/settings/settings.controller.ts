import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../common/decorators';
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

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private prisma: PrismaService) { }

    @Get('pump-info')
    async getPumpInfo() {
        // Get all pump-related settings
        const settings = await this.prisma.setting.findMany({
            where: {
                key: {
                    in: ['pump_name', 'pump_address', 'pump_phone', 'pump_tax_rate']
                }
            }
        });

        // Convert to object
        const result: Record<string, string> = {
            name: 'Al-Rehman Filling',
            address: 'N-25 Chakwal Road, Balkasar',
            phone: '0345-1234567',
            taxRate: '17',
        };

        settings.forEach(s => {
            if (s.key === 'pump_name') result.name = s.value;
            if (s.key === 'pump_address') result.address = s.value;
            if (s.key === 'pump_phone') result.phone = s.value;
            if (s.key === 'pump_tax_rate') result.taxRate = s.value;
        });

        return result;
    }

    @Put('pump-info')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async updatePumpInfo(
        @Body() dto: PumpInfoDto,
        @CurrentUser() user: AuthUser,
    ) {
        // Upsert each setting
        const updates = [
            { key: 'pump_name', value: dto.name },
            { key: 'pump_address', value: dto.address },
            { key: 'pump_phone', value: dto.phone },
            { key: 'pump_tax_rate', value: dto.taxRate },
        ];

        for (const { key, value } of updates) {
            await this.prisma.setting.upsert({
                where: { key },
                update: { value, updatedAt: new Date(), updatedById: user.id },
                create: { key, value, updatedById: user.id },
            });
        }

        return { success: true, message: 'Pump info updated successfully' };
    }
}
