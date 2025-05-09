import { Component, OnInit } from '@angular/core';
import { Client } from '../models/client';
import { Vehicle } from '../models/vehicle';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientService } from '../services/client.service';
import { AddClientModalComponent } from '../add-client-modal/add-client-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { EditClientModalComponent } from '../edit-client-modal/edit-client-modal.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, AddClientModalComponent, MatIconModule, EditClientModalComponent],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  sortedClients: Client[] = [];
  isLoading = true;

  sortKey: 'name' | 'vehicles' = 'name';
  sortAsc: boolean = true;

  showAddModal = false;
  showEditModal = false;
  selectedClientId: string = '';

  constructor(private clientService: ClientService,
              private router: Router) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data.map(client => {
          if (client.date) {
            client.date = new Date(client.date);
          }
          return client;
        });
        this.sortedClients = [...this.clients];
        this.applySorting();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
      }
    });
  }

  applySorting() {
    this.sortedClients = [...this.clients].sort((a, b) => {
      if(this.sortKey === 'name') {
        const nameA = (a.lastName + a.firstName).toLowerCase();
        const nameB = (b.lastName + b.firstName).toLowerCase();
        return this.sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (this.sortKey === 'vehicles'){
        return this.sortAsc ? a.vehicleCount - b.vehicleCount : b.vehicleCount - a.vehicleCount;
      }
      return 0;
    });
  }

  sortBy(key: 'name' | 'vehicles'){
    if(this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
    this.applySorting();
  }

  goToClient(clientId: string): void {
    this.router.navigate(['/clients', clientId]);
  }

  editClient(clientId: string): void {
    this.openEditModal(clientId);
  }

  toggleClientStatus(event: Event, client: Client) {
    event.stopPropagation();
    client.isActive = !client.isActive;
    if (!client.isActive) {
      this.clientService.deactivateClient(client.id).subscribe(() => {
        this.applySorting();
      });
    } else {
      this.clientService.reactivateClient(client.id).subscribe(() => {
        this.applySorting();
      });
    }
  }

  openAddModal() {
    this.showAddModal = true;
    this.showEditModal = false;
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedClientId = '';
  }

  openEditModal(clientId: string) {
    this.selectedClientId = clientId;
    this.showEditModal = true;
    this.showAddModal = false;
  }


  onSaveNewClient() {
    this.loadClients();
  }

  onClientUpdated(updatedClient: Client) {
    const index = this.clients.findIndex(cli => cli.id === updatedClient.id);
    if(index !== -1) {
      this.clients[index] = updatedClient;
      this.applySorting();
    }
    this.loadClients();
  }
}