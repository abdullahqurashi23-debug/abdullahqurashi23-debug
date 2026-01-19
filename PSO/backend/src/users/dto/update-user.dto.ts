import { IsEnum, IsOptional } from 'class-validator';

export enum UserStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export class UpdateUserStatusDto {
    @IsEnum(UserStatus)
    status: UserStatus;
}

export class UpdateUserDto {
    @IsOptional()
    fullName?: string;

    @IsOptional()
    phone?: string;
}
