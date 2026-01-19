export declare enum TransactionType {
    CASH_DEPOSIT = "CASH_DEPOSIT",
    CASH_WITHDRAWAL = "CASH_WITHDRAWAL",
    EXPENSE = "EXPENSE",
    FUEL_PURCHASE = "FUEL_PURCHASE",
    CREDIT_RECEIVED = "CREDIT_RECEIVED",
    OTHER = "OTHER"
}
export declare class CreateTransactionDto {
    type: TransactionType;
    amount: number;
    description?: string;
    reference?: string;
    bankName?: string;
}
export declare class CreateExpenseDto {
    amount: number;
    category: string;
    description?: string;
    vendor?: string;
    receiptNumber?: string;
}
