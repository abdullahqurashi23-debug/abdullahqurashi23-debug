export interface TankStats {
    fuelType: 'PETROL' | 'DIESEL';
    currentLevel: number;
    capacity: number;
    percentageFull: number;
    isLow: boolean;
}

export interface DashboardStats {
    todaySales: number;
    todayLiters: number;
    todayTransactions: number;
    cashInHand: number;
    activeOperators: number;
    percentageChange: string;
}
