export declare enum FuelType {
    PETROL = "PETROL",
    DIESEL = "DIESEL"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    CREDIT = "CREDIT",
    EASYPAISA = "EASYPAISA",
    JAZZCASH = "JAZZCASH"
}
export declare class CreateSaleDto {
    shiftId: string;
    fuelType: FuelType;
    liters: number;
    paymentMethod: PaymentMethod;
    vehicleNumber?: string;
    customerName?: string;
    customerPhone?: string;
    creditCustomerId?: string;
    notes?: string;
}
