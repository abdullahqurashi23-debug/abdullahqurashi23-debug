import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { TanksService } from './tanks.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../common/decorators';

@Controller('tanks')
@UseGuards(JwtAuthGuard)
export class TanksController {
    constructor(private tanksService: TanksService) { }

    @Get()
    async findAll() {
        return this.tanksService.findAll();
    }

    @Get('stats')
    async getStats() {
        return this.tanksService.getStats();
    }

    @Get('predictions')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async getPredictions() {
        return this.tanksService.getPredictions();
    }

    @Get('deliveries')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async getDeliveries(@Query('take') take?: string) {
        return this.tanksService.getDeliveries(take ? parseInt(take) : 10);
    }

    @Get(':fuelType')
    async findByType(@Param('fuelType') fuelType: 'PETROL' | 'DIESEL') {
        return this.tanksService.findByType(fuelType);
    }

    // Admin can directly set tank level (for corrections, resets, etc.)
    @Patch(':fuelType/level')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async setTankLevel(
        @Param('fuelType') fuelType: 'PETROL' | 'DIESEL',
        @Body() data: { currentLevel: number },
    ) {
        return this.tanksService.setLevel(fuelType, data.currentLevel);
    }

    @Post('delivery')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async recordDelivery(
        @Body() data: {
            fuelType: 'PETROL' | 'DIESEL';
            quantityLiters: number;
            pricePerLiter: number;
            supplierName: string;
            invoiceNumber?: string;
            density?: number;
            temperature?: number;
        },
        @CurrentUser() user: { id: string },
    ) {
        return this.tanksService.recordDelivery({
            ...data,
            receivedById: user.id,
        });
    }
}
