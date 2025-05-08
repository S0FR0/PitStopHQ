import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReplacedPart } from '../models/replaced-part';

@Injectable({
  providedIn: 'root'
})
export class ReplacedPartService {
  private apiUrl = 'http://localhost:3000/replaced-parts';

  constructor(private http: HttpClient) { }

  getReplacedPartsByReservationDetailsId(reservationDetailsId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?reservationDetailsId=${reservationDetailsId}`);
  }

  createReplacedPart(replacedPart: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, replacedPart);
  }

  updateReplacedPart(part: ReplacedPart): Observable<ReplacedPart> {
    return this.http.put<ReplacedPart>(`${this.apiUrl}/${part.id}`, part);
  }

  deleteReplacedPartsByReservationDetailsId(reservationDetailsId: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}?reservationDetailsId=${reservationDetailsId}`);
  }

  deleteReplacedPart(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}