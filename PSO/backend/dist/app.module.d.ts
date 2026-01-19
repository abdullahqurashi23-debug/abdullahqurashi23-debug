import { OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { TanksService } from './tanks/tanks.service';
export declare class AppModule implements OnModuleInit {
    private authService;
    private tanksService;
    constructor(authService: AuthService, tanksService: TanksService);
    onModuleInit(): Promise<void>;
}
