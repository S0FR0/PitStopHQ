import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleConditionService {
  private apiUrl = 'http://localhost:3000/vehicle-conditions';

  constructor(private http: HttpClient) { }

  getVehicleConditionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createVehicleCondition(vehicleCondition: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, vehicleCondition);
  }

  updateVehicleCondition(vehicleCondition: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${vehicleCondition.id}`, vehicleCondition);
  }
}