import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationFormModalComponent } from '../reservation-form-modal/reservation-form-modal.component';
import { EditReservationModalComponent } from '../edit-reservation-modal/edit-reservation-modal.component';
import { ReservationWithClientVehicle } from '../models/reservation-with-client-vehicle';
import { Reservation } from '../models/reservation';
import { ReservationService } from '../services/reservation.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    ReservationFormModalComponent, 
    EditReservationModalComponent, 
    CommonModule, 
    MatIcon,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss'
})
export class ReservationsComponent {

  reservations: ReservationWithClientVehicle[] = [];
  sortedReservations: ReservationWithClientVehicle[] = [];
  
  // Modal control properties
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedReservationId: string = '';
  
  constructor(private reservationService: ReservationService,
              private router: Router) {}

  ngOnInit(): void {
    this.getReservations();
  }

  getReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.sortedReservations = [...this.reservations];
        this.applySorting();
      },
      error: (error) => console.error('Error loading reservations:', error)
    });
  }

  applySorting() {
    this.sortedReservations = [...this.reservations].sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if(dateComparison === 0) return a.time.localeCompare(b.time);
      return dateComparison;
    });
  }

  goToReservation(reservationId: string): void {
    this.router.navigate(['reservation', reservationId]);
  }

  // Modal control methods
  openAddModal(): void {
    this.showAddModal = true;
    this.showEditModal = false;
  }

  openEditModal(reservationId: string): void {
    this.selectedReservationId = reservationId;
    this.showEditModal = true;
    this.showAddModal = false;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedReservationId = '';
  }

  onSaveNewReservation(): void {
    this.closeModal();
    this.getReservations();
  }

  onReservationUpdated(updatedReservation: Reservation): void {
    this.closeModal();
    this.getReservations();
  }

  onReservationDeleted(reservationId: string): void {
    this.closeModal();
    this.getReservations();
  }

  // Delete methods
  showDeleteConfirmation(reservationId: string): void {
    this.selectedReservationId = reservationId;
    this.showDeleteModal = true;
  }
  
  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  deleteReservation(): void {
    this.reservationService.deleteReservation(this.selectedReservationId).subscribe({
      next: () => {
        this.getReservations();
        this.showDeleteModal = false;
      },
      error: (error) => console.error('Error deleting reservation:', error)
    });
  }
}