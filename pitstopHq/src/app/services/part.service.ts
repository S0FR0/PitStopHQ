import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Part } from '../models/part';

@Injectable({
  providedIn: 'root'
})
export class PartService {
  private apiUrl = 'http://localhost:3000/parts';

  constructor(private http: HttpClient) { }

  getAllParts(): Observable<Part[]> {
    return this.http.get<Part[]>(this.apiUrl);
  }

  getPartById(partId: string): Observable<Part> {
    return this.http.get<Part>(`${this.apiUrl}/${partId}`);
  }

  createPart(part: Part): Observable<Part> {
    return this.http.post<Part>(this.apiUrl, part);
  }

  updatePart(part: Part): Observable<Part> {
    return this.http.put<Part>(`${this.apiUrl}/${part.id}`, part);
  }

  deletePart(partId: string): Observable<Part> {
    return this.http.delete<Part>(`${this.apiUrl}/${partId}`);
  }

  searchParts(query: string): Observable<Part[]> {
    return this.http.get<Part[]>(`${this.apiUrl}?q=${query}`);
  }

  addPart(partId: string ,amount: number): void {
    this.getPartById(partId).subscribe({
      next: (data) => {
        data.stockQuantity += amount;
        this.updatePart(data).subscribe({
          next: () => console.log("Succesfully added"),
          error: (error) => console.error('Error updating part:', error)
        })
      },
      error: (error) => console.error('Error loading quantity:', error)
    })
  }
}