import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '../models/client';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from './vehicle.service';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { Reservation } from '../models/reservation';
import { ReservationService } from './reservation.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:3000/clients'
  private vehiclesUrl = 'http://localhost:3000/vehicles'

  constructor(private http: HttpClient, private vehicleService: VehicleService, private reservationService: ReservationService) { }

  getClients(): Observable<Client[]> {
    return forkJoin({
      clients: this.http.get<Client[]>(this.apiUrl),
      vehicles: this.http.get<Vehicle[]>(this.vehiclesUrl)
    }).pipe(
      map(({ clients, vehicles}) => {
        console.log(vehicles)
        return clients.map(client => {
          const vehicle = vehicles.filter( vehicle => vehicle.clientId == client.id);
          console.log(vehicle)
          const vehicleCount = vehicle.length;
          console.log(vehicleCount)
          return {
            ...client,
            vehicleCount: vehicleCount
          }
        })
      })
    )
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  addClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(id: string, updates: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, updates);
  }

  deactivateClient(id: string): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}`, {isActive: false});
  }

  reactivateClient(id: string): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}`, {isActive: true});
  }

  deleteClient(id: string): Observable<any> {
    return forkJoin({
      vehicles: this.vehicleService.getVehiclesByClient(id),
      reservations: this.reservationService.getReservationsByClientId(id)
    }).pipe(
      switchMap(({ vehicles, reservations }) => {
        
        const deleteVehicles = vehicles ?
        vehicles.map(vehicle => this.vehicleService.deleteVehicle(vehicle.id)) : [];
        
        const deleteReservations = reservations ?
        reservations.map(reservation => this.reservationService.deleteReservation(reservation.id)) : [];

        const deleteAll = [...deleteVehicles, ...deleteReservations];

        if(deleteAll.length === 0)
          return this.http.delete(`${this.apiUrl}/${id}`)
      
        return forkJoin(deleteAll).pipe(
          switchMap(() => this.http.delete(`${this.apiUrl}/${id}`))
        )
      })
    )
  }
}
