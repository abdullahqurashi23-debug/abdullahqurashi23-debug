import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum FuelType {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    CREDIT = 'CREDIT',
    EASYPAISA = 'EASYPAISA',
    JAZZCASH = 'JAZZCASH',
}

export class CreateSaleDto {
    @IsString()
    shiftId: string;

    @IsEnum(FuelType)
    fuelType: FuelType;

    @IsNumber()
    @Min(0.1)
    liters: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    vehicleNumber?: string;

    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsOptional()
    @IsString()
    creditCustomerId?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
