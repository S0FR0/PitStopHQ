import { ReservationDetails } from "./reservation-details";

export interface ReservationDetailsWithReservationVehicle extends ReservationDetails {
    reservationTitle?: string;
    reservationDate?: string;
    vehicleId?: string;
}
