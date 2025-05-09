import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ReservationDetailsFormComponent } from '../reservation-details-form/reservation-details-form.component';
import { ReservationDetailsService } from '../services/reservation-details.service';
import { ReservationService } from '../services/reservation.service';
import { ReservationWithClientVehicle } from '../models/reservation-with-client-vehicle';
import { ReservationDetails } from '../models/reservation-details';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReservationDetailsFormComponent
  ],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit {
  
  reservationId: string = '';
  reservation: ReservationWithClientVehicle | null = null;
  details: ReservationDetails | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private reservationDetailsService: ReservationDetailsService
  ) { }

  ngOnInit(): void {
    this.reservationId = this.route.snapshot.paramMap.get('reservationId')!;
    this.loadReservation();
    this.loadReservationDetails();
  }

  loadReservation(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reservationService.getReservation(this.reservationId).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reservation:', error);
        this.isLoading = false;
      }
    });
  }

  loadReservationDetails(): void {
    if (!this.reservationId) return;
    
    this.reservationDetailsService.getReservationDetailsByReservationId(this.reservationId).subscribe({
      next: (details) => {
        this.details = details;
      },
      error: (error) => {
        console.error('Error loading reservation:', error);
      }
    });
  }

  onDetailsUpdated(details: ReservationDetails): void {
    this.details = details;
  }

  goBack(): void {
    window.history.back();
  }
}