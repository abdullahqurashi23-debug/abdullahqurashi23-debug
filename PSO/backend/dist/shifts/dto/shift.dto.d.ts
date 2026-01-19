export declare enum ShiftType {
    MORNING = "MORNING",
    EVENING = "EVENING",
    NIGHT = "NIGHT"
}
export declare class StartShiftDto {
    shiftType: ShiftType;
    openingCash: number;
    openingPetrolLevel: number;
    openingDieselLevel: number;
}
export declare class EndShiftDto {
    closingCash: number;
    closingPetrolLevel: number;
    closingDieselLevel: number;
    notes?: string;
}
