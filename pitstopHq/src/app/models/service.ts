export interface Service {
    id: string;
    vehicleId: string;
    reservationId: string;
    receptionNotes: string;
    serviceOperations: string;
    repairsMade: string;
    otherIssuesFound: string;
    otherIssuesRepaired: boolean;
    duration: number;
    replacedParts: string[];
    tehnician: string;
    totalCost: number;
}
