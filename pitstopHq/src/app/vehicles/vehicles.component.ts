import { Component } from '@angular/core';
import { VehicleWithClient } from '../models/vehicle-with-client';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../services/vehicle.service';
import { Router } from '@angular/router';
import { EditVehicleComponent } from '../edit-vehicle-modal/edit-vehicle-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-vehicles-page',
  imports: [CommonModule, EditVehicleComponent, MatIconModule, DeleteConfirmationModalComponent],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesPageComponent {

  vehicles: VehicleWithClient[] = [];

  showModal = false;
  selectedVehicleId: string = '';
  
  showDeleteModal = false;
  vehicleToDeleteId: string = '';

  constructor(private vehicleService: VehicleService,
              private router: Router) {}

  ngOnInit(): void {
    this.getVehicles();
  }

  getVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        return this.vehicles;
      },
      error: (error) => {
        console.error('Error at loading vehicles:', error);
      }
    })
  }

  goToVehicle(vehicleId: string):void {
    this.router.navigate(['vehicle-details', vehicleId]);
  }

  openModal(clientId: string) {
    this.selectedVehicleId = clientId;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.showDeleteModal = false;
    this.selectedVehicleId = '';
  }

  onVehicleUpdated(updatedVehicle: VehicleWithClient) {
    const index = this.vehicles.findIndex(vehicle => vehicle.id === updatedVehicle.id);
    if(index !== -1) {
      this.vehicles[index] = updatedVehicle;
    }
    this.getVehicles();
  }

  confirmDeleteVehicle(vehicleId: string): void {
    this.vehicleToDeleteId = vehicleId;
    this.showDeleteModal = true;
  }

  cancelDeleteVehicle(): void {
    this.showDeleteModal = false;
    this.vehicleToDeleteId = '';
  }

  handleConfirmDelete(): void {
    this.showDeleteModal = false;
    this.vehicleService.deleteVehicle(this.vehicleToDeleteId).subscribe({
      next: () => {
        this.getVehicles();
      },
      error: (error) => console.error('Error deleting vehicle:', error)
    });
    this.vehicleToDeleteId = '';
  }

  deleteVehicle(vehicleId: string): void {
    if(confirm('Are you sure you want to delete vehicle?')){
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: () => {
          this.getVehicles();
        },
        error: (error) => console.error('Error deleting vehicle:', error)
      })
    }
  }
}