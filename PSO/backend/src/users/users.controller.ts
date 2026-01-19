import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../common/decorators';
import { UpdateUserStatusDto, UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @Roles('ADMIN')
    async findAll(@Query('role') role?: string) {
        return this.usersService.findAll(role);
    }

    @Get('operators')
    @Roles('ADMIN')
    async getOperators() {
        return this.usersService.getOperators();
    }

    @Get('operators/pending')
    @Roles('ADMIN')
    async getPendingOperators() {
        return this.usersService.getPendingOperators();
    }

    @Patch('operators/:id/approve')
    @Roles('ADMIN')
    async approveOperator(@Param('id') id: string) {
        return this.usersService.approveOperator(id);
    }

    @Patch('operators/:id/suspend')
    @Roles('ADMIN')
    async suspendOperator(@Param('id') id: string) {
        return this.usersService.suspendOperator(id);
    }

    @Patch(':id/status')
    @Roles('ADMIN')
    async updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserStatusDto,
    ) {
        return this.usersService.updateStatus(id, updateDto);
    }

    @Patch(':id')
    async updateProfile(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserDto,
    ) {
        return this.usersService.updateProfile(id, updateDto);
    }

    @Delete('operators/:id')
    @Roles('ADMIN')
    async deleteOperator(@Param('id') id: string) {
        return this.usersService.deleteOperator(id);
    }
}
