import { Reservation } from "./reservation";

export interface ReservationWithClientVehicle extends Reservation{
    clientName?: string;
    clientPhoneNumber?: string;
    clientSecondaryPhoneNumber?: string;
    clientEmail?: string;

    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehicleLicensePlate?: string; 
    vehicleChassisNumber?: string;
}
