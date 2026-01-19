import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
    ADMIN = 'ADMIN',
    OPERATOR = 'OPERATOR',
}

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    cnic?: string;
}
