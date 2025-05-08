import { TimeSlot } from "./time-slot";

export interface Availability {
    date: string;
    slots: TimeSlot[];
    hasAvailableSlots: boolean;
}
