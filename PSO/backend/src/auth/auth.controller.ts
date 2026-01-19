import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard, RolesGuard } from './guards';
import { CurrentUser, Roles } from '../common/decorators';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async register(
        @Body() registerDto: RegisterDto,
        @CurrentUser() user: { id: string },
    ) {
        return this.authService.register(registerDto, user.id);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: { id: string }) {
        return this.authService.getProfile(user.id);
    }
}
