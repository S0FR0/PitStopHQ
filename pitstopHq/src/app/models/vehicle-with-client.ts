import { Vehicle } from "./vehicle";

export interface VehicleWithClient extends Vehicle {
    clientFName?: string,
    clientLName?: string,
    clientPhoneNumber?: string;
    clientSecondaryPhoneNumber?: string;
    clientEmail?: string;
}
