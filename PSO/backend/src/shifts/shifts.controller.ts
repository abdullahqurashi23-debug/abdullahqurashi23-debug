import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { StartShiftDto, EndShiftDto } from './dto/shift.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../common/decorators';

interface AuthUser {
    id: string;
    role: string;
}

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
    constructor(private shiftsService: ShiftsService) { }

    @Post('start')
    async startShift(
        @Body() startDto: StartShiftDto,
        @CurrentUser() user: AuthUser,
    ) {
        return this.shiftsService.startShift(user.id, startDto);
    }

    @Post(':id/end')
    async endShift(
        @Param('id') shiftId: string,
        @Body() endDto: EndShiftDto,
        @CurrentUser() user: AuthUser,
    ) {
        return this.shiftsService.endShift(user.id, shiftId, endDto);
    }

    @Get('active')
    async getActiveShift(@CurrentUser() user: AuthUser) {
        return this.shiftsService.getActiveShift(user.id);
    }

    @Get('active/all')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async getAllActiveShifts() {
        return this.shiftsService.getAllActiveShifts();
    }

    @Get('daily')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async getDailyShifts() {
        return this.shiftsService.getDailyShifts();
    }

    @Get('history')
    async getMyShiftHistory(
        @CurrentUser() user: AuthUser,
        @Query('take') take?: string,
    ) {
        return this.shiftsService.getOperatorShiftHistory(
            user.id,
            take ? parseInt(take) : 10,
        );
    }

    @Get(':id')
    async getShiftDetails(@Param('id') shiftId: string) {
        return this.shiftsService.getShiftDetails(shiftId);
    }
}
