import { Component, OnInit } from '@angular/core';
import { Client } from '../models/client';
import { Vehicle } from '../models/vehicle';
import { CommonModule } from '@angular/common';
import { ClientService } from '../services/client.service';
import { VehicleService } from '../services/vehicle.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AddVehicleModalComponent } from "../add-vehicle-modal/add-vehicle-modal.component";
import { EditVehicleComponent } from '../edit-vehicle-modal/edit-vehicle-modal.component';
import { EditClientModalComponent } from '../edit-client-modal/edit-client-modal.component';
import { MatIcon } from '@angular/material/icon';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, MatIconModule, AddVehicleModalComponent, EditVehicleComponent, EditClientModalComponent, MatIcon, DeleteConfirmationModalComponent],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss'
})
export class ClientComponent implements OnInit{

  vehicles: Vehicle[] = [];
  client: Client = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    date: new Date(),
    isActive: true,
    vehicleCount: 1
  }

  showAddVehicleModal = false;
  showEditVehicleModal = false;
  showEditClientModal = false;
  selectedVehicleId: string = '';
  
  showDeleteModal = false;
  deleteTitle = 'Confirm Delete';
  deleteMessage = 'Are you sure you want to delete?';
  pendingVehicleId = '';
  pendingClientId = '';
  pendingDeleteType: 'vehicle' | 'client' = 'vehicle';

  constructor(private clientService: ClientService,
              private vehicleService: VehicleService,
              private activeRoute: ActivatedRoute,
              private router: Router) {}

  ngOnInit(): void {
    const id = this.activeRoute.snapshot.paramMap.get('id')!;
    this.loadClient(id);
    this.getVehicles(id);
  }

  loadClient(id: string): void {
    this.clientService.getClientById(id).subscribe({
      next: (data) => {
        this.client = data;
        return this.client;
      },
      error: (error) => {
        console.error('Erro at loading client:', error)
      }
    })
  }

  goBack():void {
    this.router.navigate(['/clients'])
  }

  goToVehicle(vehicleId: string):void {
    this.router.navigate(['vehicle-details', vehicleId]);
  }

  getVehicles(id: string): void {
    this.vehicleService.getVehiclesByClient(id).subscribe({
      next: (data) => {
        this.vehicles = data
        return this.vehicles;
      },
      error: (error) => console.error('Error loading vehicles:', error)
    })
  }

  editVehicle(vehicleId: string): void {
    this.openEditVehicleModal(vehicleId);
  }

  openAddVehicleModal() {
    this.showAddVehicleModal = true;
    this.showEditVehicleModal = false;
    this.showEditClientModal = false;
  }

  closeModal() {
    this.showAddVehicleModal = false;
    this.showEditVehicleModal = false;
    this.showEditClientModal = false;
    this.showDeleteModal = false;
    this.selectedVehicleId = '';
  }

  openEditVehicleModal(vehicleId: string) {
    this.selectedVehicleId = vehicleId;
    this.showEditVehicleModal = true;
    this.showAddVehicleModal = false;
  }

  openEditClientModal() {
    this.showAddVehicleModal = false;
    this.showEditVehicleModal = false;
    this.showEditClientModal = true;
  }

  onSaveNewVehicle(event: { vehicle: Vehicle }) {
    this.vehicleService.addVehicle(event.vehicle)
    this.getVehicles(event.vehicle.clientId)
  }

  onVehicleUpdated(updatedVehicle: Vehicle) {
    const index = this.vehicles.findIndex(vehicle => vehicle.id === updatedVehicle.id);
    if(index !== -1) {
      this.vehicles[index] = updatedVehicle;
    }
    this.getVehicles(updatedVehicle.clientId);
  }

  onClientUpdate(updatedClient: Client): void {
    this.client = updatedClient;
    
    if (this.client.vehicleCount !== this.vehicles.length) {
      this.getVehicles(updatedClient.id);
    }
  }

  showVehicleDeleteConfirmation(id: string, clientId: string) {
    this.pendingVehicleId = id;
    this.pendingClientId = clientId;
    this.pendingDeleteType = 'vehicle';
    this.deleteTitle = 'Delete Vehicle';
    this.deleteMessage = 'Are you sure you want to delete this vehicle?';
    this.showDeleteModal = true;
  }

  showClientDeleteConfirmation(clientId: string) {
    this.pendingClientId = clientId;
    this.pendingDeleteType = 'client';
    this.deleteTitle = 'Delete Client';
    this.deleteMessage = 'Are you sure you want to delete this client?';
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
  }

  handleConfirmDelete() {
    this.showDeleteModal = false;
    
    if (this.pendingDeleteType === 'vehicle') {
      const mockConfirm = true;
      if (mockConfirm) {
        this.deleteVehicle(this.pendingVehicleId, this.pendingClientId);
      }
    } else {
      const mockConfirm = true;
      if (mockConfirm) {
        this.deleteClient(this.pendingClientId);
      }
    }
  }

  deleteVehicle(id: string, clientId: string) {
    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => {
        this.getVehicles(clientId)
      },
      error: (error) => {
        console.error('Error deleting vehicle', error);
      }
    });
  }

  deleteClient(clientId: string): void {
    this.clientService.deleteClient(clientId).subscribe({
      next: () => {
        this.router.navigate(['/clients'], {
          replaceUrl: true,
          state: { reload: true}
        })
      },
      error: (error) => console.error('Error deleting client:', error)
    });
  }
}