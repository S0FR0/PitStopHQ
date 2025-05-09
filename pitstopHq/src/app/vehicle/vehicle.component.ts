import { Component, OnInit } from '@angular/core';
import { VehicleWithClient } from '../models/vehicle-with-client';
import { CommonModule } from '@angular/common';
import { ClientService } from '../services/client.service';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from '../services/vehicle.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EditVehicleComponent } from '../edit-vehicle-modal/edit-vehicle-modal.component';
import { Location } from '@angular/common';
import { ReservationDetailsService } from '../services/reservation-details.service';
import { ReservationDetailsWithReservationVehicle } from '../models/reservation-details-with-reservation-vehicle';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, MatIconModule, EditVehicleComponent, DeleteConfirmationModalComponent],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss'
})
export class VehicleComponent implements OnInit {

  vehicle: VehicleWithClient = {
    id:'',
    clientId:'',
    licensePlate:'',
    chassisNumber:'',
    make:'',
    model:'',
    year:0,
    engineType:'diesel',
    engineCapacity: 0,
    horsePower:0,
    kwPower:0,
    km:0
  }

  showEditVehicleModal = false;
  showDeleteModal = false;
  
  reservationDetails: ReservationDetailsWithReservationVehicle[] = [];
  vehicleId: string = '';

  constructor(private vehicleService: VehicleService,
              private activeRoute: ActivatedRoute,
              private router: Router,
              private location: Location,
              private reservationDetailsService: ReservationDetailsService) {}

  ngOnInit(): void {
    this.vehicleId = this.activeRoute.snapshot.paramMap.get('vehicleId')!;
    this.loadVehicle();
    this.loadReservationDetails();
  }

  loadVehicle(): void {
    this.vehicleService.getVehicleById(this.vehicleId).subscribe({
      next: (data) => {
        this.vehicle = data
        return this.vehicle
      },
      error: (error) => console.error('Error at loading vehicle:', error)
    })
  }

  loadReservationDetails(): void {
    this.reservationDetailsService.getReservationDetailsByVehicleId(this.vehicleId).subscribe({
      next: (data) => {
        this.reservationDetails = data
      },
      error: (error) => console.error('Error loading data:', error)
    })
  }

  goBack(): void {
    this.location.back();
  }

  confirmDeleteVehicle(): void {
    this.showDeleteModal = true;
  }
  
  cancelDeleteVehicle(): void {
    this.showDeleteModal = false;
  }
  
  deleteVehicle(): void {
    this.vehicleService.deleteVehicle(this.vehicleId).subscribe({
      next: () => {
        this.router.navigate(['/clients'], {
          replaceUrl: true,
          state: { reload: true}
        })
      },
      error: (error) => console.error('Error deleting vehicle:', error)
    });
    this.showDeleteModal = false;
  }

  openEditModal() {
    this.showEditVehicleModal = true;
  }

  closeEditModal() {
    this.showEditVehicleModal = false;
  }

  onVehicleUpdated(updatedVehicle: Vehicle): void {
    this.vehicle = updatedVehicle;
  }

  closeModal(): void {
    this.showEditVehicleModal = false;
    this.showDeleteModal = false;
  }
}