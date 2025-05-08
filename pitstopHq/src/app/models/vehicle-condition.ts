export interface VehicleCondition {
    id: string;
    reservationDetailsId: string;
    isDamaged: boolean;
    damageDescription: string;
    isScratched: boolean;
    scratchDescription: string;
    hasMechanicalIssues: boolean;
    mechanicalIssuesDescription: string;
    hasElectricalIssues: boolean;
    electricalIssuesDescription: string;
}
