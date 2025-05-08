import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation';
import { Vehicle } from '../models/vehicle';
import { Client } from '../models/client';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:3000/reservations';
  private vehiclesUrl = 'http://localhost:3000/vehicles';
  private clientsUrl = 'http://localhost:3000/clients';

  constructor(private http: HttpClient) { }

  getReservations(): Observable<Reservation[]> {
    return forkJoin({
      reservations: this.http.get<Reservation[]>(this.apiUrl),
      vehicles: this.http.get<Vehicle[]>(this.vehiclesUrl),
      clients: this.http.get<Client[]>(this.clientsUrl)
    }).pipe(
      map(({ reservations, vehicles, clients}) => {
        return reservations.map( reservation => {
          const vehicle = vehicles.find( vehicle => vehicle.id === reservation.vehicleId)
          const client = clients.find( client => client.id === reservation.clientId)
          return {
            ...reservation,
            
            clientName: `${client?.firstName} ${client?.lastName}`,
            clientPhoneNumber: client?.phone,
            clientSecondaryPhoneNumber: client?.secondaryPhone,
            clientEmail: client?.email,

            vehicleMake: vehicle?.make,
            vehicleModel: vehicle?.model,
            vehicleYear: vehicle?.year,
            vehicleLicensePlate: vehicle?.licensePlate,
            vehicleChassisNumber: vehicle?.chassisNumber,
          }
        })
      })
    )
  }

  getReservation(reservationId: string): Observable<Reservation> {
    return forkJoin({
      reservation: this.http.get<Reservation>(`${this.apiUrl}/${reservationId}`),
      vehicles: this.http.get<Vehicle[]>(this.vehiclesUrl),
      clients: this.http.get<Client[]>(this.clientsUrl)
    }).pipe(
      map(({ reservation, vehicles, clients }) => {

        const vehicle = vehicles.find(vehicle => vehicle.id === reservation.vehicleId);
        const client = clients.find(client => client.id === reservation.clientId)

        return {
          ...reservation,
            
            clientName: `${client?.firstName} ${client?.lastName}`,
            clientPhoneNumber: client?.phone,
            clientSecondaryPhoneNumber: client?.secondaryPhone,
            clientEmail: client?.email,

            vehicleMake: vehicle?.make,
            vehicleModel: vehicle?.model,
            vehicleYear: vehicle?.year,
            vehicleLicensePlate: vehicle?.licensePlate,
            vehicleChassisNumber: vehicle?.chassisNumber,
        }
      })
    )
  }

  getReservationsByClientId(clientId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?clientId=${clientId}`)
  }

  getReservationsByVehicleId(vehicleId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?vehicleId=${vehicleId}`)
  }

  createReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation)
  }

  deleteReservation(reservationId: string): Observable<Reservation> {
    return this.http.delete<Reservation>(`${this.apiUrl}/${reservationId}`)
  }

  updateReservation(reservationId: string, updates: Partial<Reservation>): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}`, updates)
  }

}
