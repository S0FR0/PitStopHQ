export interface Vehicle {
    id: string;
    clientId: string;
    licensePlate: string;
    chassisNumber: string;
    make: string;
    model: string;
    year: number;
    engineType: 'diesel' | 'gas' | 'hybrid' | 'electric';
    engineCapacity: number;
    horsePower: number;
    kwPower: number;
    km: number
}
