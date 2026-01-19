export declare enum UserStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class UpdateUserStatusDto {
    status: UserStatus;
}
export declare class UpdateUserDto {
    fullName?: string;
    phone?: string;
}
