export declare enum UserRole {
    ADMIN = "ADMIN",
    OPERATOR = "OPERATOR"
}
export declare class RegisterDto {
    username: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    cnic?: string;
}
