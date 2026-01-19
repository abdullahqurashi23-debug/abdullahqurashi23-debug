import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TransactionType {
    CASH_DEPOSIT = 'CASH_DEPOSIT',
    CASH_WITHDRAWAL = 'CASH_WITHDRAWAL',
    EXPENSE = 'EXPENSE',
    FUEL_PURCHASE = 'FUEL_PURCHASE',
    CREDIT_RECEIVED = 'CREDIT_RECEIVED',
    OTHER = 'OTHER',
}

export class CreateTransactionDto {
    @IsEnum(TransactionType)
    type: TransactionType;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    reference?: string;

    @IsOptional()
    @IsString()
    bankName?: string;
}

export class CreateExpenseDto {
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsString()
    category: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    vendor?: string;

    @IsOptional()
    @IsString()
    receiptNumber?: string;
}
