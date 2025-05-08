import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { Vehicle } from '../models/vehicle';
import { Client } from '../models/client';
import { VehicleWithClient } from '../models/vehicle-with-client';
import { Reservation } from '../models/reservation';
import { ReservationService } from './reservation.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'http://localhost:3000/vehicles';
  private clientsUrl = 'http://localhost:3000/clients';

  constructor(private http: HttpClient, private reservationService: ReservationService) { }

  getVehicles(): Observable<VehicleWithClient[]> {
    return forkJoin({
      vehicles: this.http.get<Vehicle[]>(this.apiUrl),
      clients: this.http.get<Client[]>(this.clientsUrl)
    }).pipe(
      map(({ vehicles, clients }) => {
        return vehicles.map( vehicle => {
          const client = clients.find( client => client.id === vehicle.clientId)
          return {
            ...vehicle,

            clientFName: client?.firstName,
            clientLName: client?.lastName,
            clientPhoneNumber: client?.phone,
            clientSecondaryPhoneNumber: client?.secondaryPhone,
            clientEmail: client?.email,
          }
        })
      })
    )
  }

  getVehicleById(vehicleId: string): Observable<VehicleWithClient> {
    return forkJoin({
      vehicle: this.http.get<Vehicle>(`${this.apiUrl}/${vehicleId}`),
      clients: this.http.get<Client[]>(this.clientsUrl)
    }).pipe(
      map(({ vehicle, clients }) => {

          const client = clients.find( client => client.id === vehicle.clientId)
          return {
            ...vehicle,

            clientFName: client?.firstName,
            clientLName: client?.lastName,
            clientPhoneNumber: client?.phone,
            clientSecondaryPhoneNumber: client?.secondaryPhone,
            clientEmail: client?.email,
          }
      })
    )
  }

  getVehiclesByClient(clientId: string): Observable<Vehicle[]>{
    return this.http.get<Vehicle[]>(`${this.apiUrl}?clientId=${clientId}`)
  }

  addVehicle(vehicle: Vehicle): Observable<Vehicle>{
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): Observable<Vehicle>{
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, updates)
  }

  updateVehicleKm(id: string, km: number): Observable<Vehicle>{
    return this.http.patch<Vehicle>(`${this.apiUrl}/${id}`, { km: km });
  }

  deleteVehicle(id: string): Observable<any>{
    return this.reservationService.getReservationsByVehicleId(id).pipe(
      switchMap(reservations => {
        if(!reservations || reservations.length === 0)
          return this.http.delete(`${this.apiUrl}/${id}`)
      
        const deleteReservations = reservations.map(reservation =>
          this.reservationService.deleteReservation(reservation.id)
        )

        return forkJoin(deleteReservations).pipe(
          switchMap(() => this.http.delete(`${this.apiUrl}/${id}`))
        )
      })
    )
  }

}
