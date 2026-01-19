import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../common/decorators';

interface AuthUser {
    id: string;
    role: string;
    activeShiftId?: string;
}

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
    constructor(private salesService: SalesService) { }

    @Post()
    async create(
        @Body() createDto: CreateSaleDto,
        @CurrentUser() user: AuthUser,
    ) {
        return this.salesService.create(createDto, user.id, createDto.shiftId);
    }

    @Get('today')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async getTodaySales() {
        return this.salesService.getTodaySales();
    }

    @Get('my-today')
    async getMyTodaySales(@CurrentUser() user: AuthUser) {
        return this.salesService.getOperatorTodaySales(user.id);
    }

    @Get('shift/:shiftId')
    async getShiftSales(@Param('shiftId') shiftId: string) {
        return this.salesService.getShiftSales(shiftId);
    }

    @Get('prices')
    async getFuelPrices() {
        return this.salesService.getFuelPrices();
    }

    @Patch('prices/:fuelType')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async updateFuelPrice(
        @Param('fuelType') fuelType: string,
        @Body('price') price: number,
        @CurrentUser() user: AuthUser,
    ) {
        return this.salesService.updateFuelPrice(fuelType.toUpperCase(), price, user.id);
    }

    @Get('dashboard')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async getDashboardStats() {
        return this.salesService.getDashboardStats();
    }

    @Patch(':id/approve')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async approveCreditSale(
        @Param('id') id: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.salesService.approveCreditSale(id, user.id);
    }

    @Patch(':id/reject')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async rejectCreditSale(
        @Param('id') id: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.salesService.rejectCreditSale(id, user.id);
    }
    @Get('analytics')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async getAnalytics(@Query('range') range: string) {
        return this.salesService.getAnalytics(range);
    }
}
