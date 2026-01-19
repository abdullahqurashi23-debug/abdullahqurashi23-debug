import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export enum ShiftType {
    MORNING = 'MORNING',
    EVENING = 'EVENING',
    NIGHT = 'NIGHT',
}

export class StartShiftDto {
    @IsEnum(ShiftType)
    shiftType: ShiftType;

    @IsNumber()
    @Min(0)
    openingCash: number;

    @IsNumber()
    @Min(0)
    openingPetrolLevel: number;

    @IsNumber()
    @Min(0)
    openingDieselLevel: number;
}

export class EndShiftDto {
    @IsNumber()
    @Min(0)
    closingCash: number;

    @IsNumber()
    @Min(0)
    closingPetrolLevel: number;

    @IsNumber()
    @Min(0)
    closingDieselLevel: number;

    @IsOptional()
    notes?: string;
}
