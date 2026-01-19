import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, PrismaService } from './prisma';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { UsersModule } from './users/users.module';
import { ShiftsModule } from './shifts/shifts.module';
import { SalesModule } from './sales/sales.module';
import { TanksModule } from './tanks/tanks.module';
import { TanksService } from './tanks/tanks.service';
import { GatewayModule } from './gateway/gateway.module';
import { BankingModule } from './banking/banking.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    GatewayModule,
    AuthModule,
    UsersModule,
    ShiftsModule,
    SalesModule,
    TanksModule,
    BankingModule,
    MessagesModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private authService: AuthService,
    private tanksService: TanksService,
  ) { }

  async onModuleInit() {
    // Seed default admin if none exists
    await this.authService.seedDefaultAdmin();

    // Initialize fuel tanks if they don't exist
    await this.tanksService.initializeTanks();
  }
}
