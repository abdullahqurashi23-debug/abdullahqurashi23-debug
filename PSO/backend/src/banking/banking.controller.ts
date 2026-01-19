import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BankingService } from './banking.service';
import { CreateExpenseDto } from './dto/banking.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../common/decorators';

interface AuthUser {
    id: string;
    role: string;
}

@Controller('banking')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class BankingController {
    constructor(private bankingService: BankingService) { }

    @Get('cash-flow')
    async getCashFlow() {
        return this.bankingService.getTodayCashFlow();
    }

    @Get('monthly-summary')
    async getMonthlySummary() {
        return this.bankingService.getMonthlySummary();
    }

    @Get('transactions')
    async getTransactions(
        @Query('take') take?: string,
        @Query('type') type?: string,
    ) {
        return this.bankingService.getTransactions(
            take ? parseInt(take) : 20,
            type,
        );
    }

    @Post('deposit')
    async recordDeposit(
        @Body() data: { amount: number; bankName?: string; reference?: string; description?: string },
        @CurrentUser() user: AuthUser,
    ) {
        return this.bankingService.recordDeposit({
            ...data,
            depositedById: user.id,
        });
    }

    @Get('expenses')
    async getExpenses(
        @Query('take') take?: string,
        @Query('category') category?: string,
    ) {
        return this.bankingService.getExpenses(
            take ? parseInt(take) : 20,
            category,
        );
    }

    @Get('expenses/by-category')
    async getExpensesByCategory() {
        return this.bankingService.getExpensesByCategory();
    }

    @Post('expenses')
    async recordExpense(
        @Body() data: CreateExpenseDto,
        @CurrentUser() user: AuthUser,
    ) {
        return this.bankingService.recordExpense(data, user.id);
    }

    @Get('credit-customers')
    @Roles('ADMIN', 'OPERATOR')
    async getCreditCustomers() {
        return this.bankingService.getCreditCustomers();
    }

    @Post('credit-customers')
    async createCreditCustomer(
        @Body() data: { name: string; phone?: string; cnic?: string; address?: string; creditLimit: number },
        @CurrentUser() user: AuthUser,
    ) {
        return this.bankingService.createCreditCustomer(data);
    }

    @Post('credit-customers/:id/payment')
    async receiveCreditPayment(
        @Param('id') customerId: string,
        @Body('amount') amount: number,
        @CurrentUser() user: AuthUser,
    ) {
        return this.bankingService.receiveCreditPayment(customerId, amount, user.id);
    }
}
