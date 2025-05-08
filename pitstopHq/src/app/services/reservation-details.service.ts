import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, of, forkJoin } from 'rxjs';
import { ReservationDetails } from '../models/reservation-details';
import { Reservation } from '../models/reservation';
import { Vehicle } from '../models/vehicle';

@Injectable({
  providedIn: 'root'
})
export class ReservationDetailsService {
  private apiUrl = 'http://localhost:3000/reservation-details';
  private vehicleUrl = 'http://localhost:3000/vehicles';
  private reservationUrl = 'http://localhost:3000/reservations';

  constructor(private http: HttpClient) { }

  getReservationDetails(): Observable<ReservationDetails[]> {
    return this.http.get<ReservationDetails[]>(this.apiUrl);
  }

  getReservationDetailsByVehicleId(targetVehicleId: string): Observable<ReservationDetails[]> {
    return forkJoin({
      reservationDetails: this.http.get<ReservationDetails[]>(this.apiUrl),
      reservations: this.http.get<Reservation[]>(this.reservationUrl),
      vehicles: this.http.get<Vehicle[]>(this.vehicleUrl)
    }).pipe(
      map(({ reservationDetails, reservations, vehicles }) => {
        const relevantReservationIds = reservations
          .filter(res => res.vehicleId === targetVehicleId)
          .map(res => res.id);
        
        return reservationDetails
          .filter(detail => relevantReservationIds.includes(detail.reservationId))
          .map(detail => {
            const reservation = reservations.find(r => r.id === detail.reservationId);
            const vehicle = vehicles.find(v => v.id === targetVehicleId);
            
            return {
              ...detail,
              reservationTitle: reservation?.title,
              reservationDate: reservation?.date,
              vehicleId: vehicle?.id
            };
          });
      })
    );
  }

  getReservationDetailsById(detailsId: string): Observable<ReservationDetails> {
    return this.http.get<ReservationDetails>(`${this.apiUrl}/${detailsId}`);
  }

  getReservationDetailsByReservationId(reservationId: string): Observable<ReservationDetails | null> {
    return this.http.get<ReservationDetails[]>(`${this.apiUrl}?reservationId=${reservationId}`)
      .pipe(
        map(results => results && results.length ? results[0] : null),
        catchError(() => of(null))
      );
  }

  createReservationDetails(details: ReservationDetails): Observable<ReservationDetails> {
    return this.http.post<ReservationDetails>(this.apiUrl, details);
  }

  updateReservationDetails(details: ReservationDetails): Observable<ReservationDetails> {
    return this.http.put<ReservationDetails>(`${this.apiUrl}/${details.id}`, details);
  }

  deleteReservationDetails(detailsId: string): Observable<ReservationDetails> {
    return this.http.delete<ReservationDetails>(`${this.apiUrl}/${detailsId}`);
  }
}