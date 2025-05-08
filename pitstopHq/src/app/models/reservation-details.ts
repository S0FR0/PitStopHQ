export interface ReservationDetails {
    id: string;
    reservationId: string;
    serviceType: 'Scheduled maintenance' | 'Repair' | 'Parts replacement' | 'Diagnostics' | 'Other';
    description: string;
    cost: number;
    duration: number;
    mechanic: string;
    notes: string;
    partsNeeded: string;
    currentKm: number;
    vehicleConditionId: string;
}
