import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from '../services/vehicle.service';
import { ReservationWithClientVehicle } from '../models/reservation-with-client-vehicle';
import { ReservationService } from '../services/reservation.service';
import { ReservationDetailsService } from '../services/reservation-details.service';
import { ReservationDetails } from '../models/reservation-details';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {

  clients: Client[] = [];
  sortedClients: Client[] = [];
  vehicles: Vehicle[] = [];
  activeClients: number = 0;
  inactiveClients: number = 0;
  reservations: ReservationWithClientVehicle[] = [];
  sortedReservations: ReservationWithClientVehicle[] = [];
  searchTerm: string = '';
  filteredClients: Client[] = [];
  
  sortKey: 'name' | 'vehicle' = 'name';
  sortAsc: boolean = true;

  reservationDetails: ReservationDetails[] = [];
  revenues: number = 0;

  maxWidth = 1500;
  phoneWidth = 650;
  showDiv = false;
  showData = true;

  constructor(private clientService: ClientService,
              private reservationsService: ReservationService,
              private vehicleService: VehicleService,
              private reservationDetaisService: ReservationDetailsService,
              private router: Router) {}

  ngOnInit(): void {
    this.loadClients();
    this.checkWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkWidth();
  }

  checkWidth() {
    this.showDiv = window.innerWidth < this.maxWidth;
    this.showData = window.innerWidth > this.phoneWidth;
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.sortedClients = [...this.clients];
        this.countActiveClients();
        this.loadReservations();
        this.loadVehicles();
        this.loadRevenues();
        this.reservations[0];
      },
      error: (error) => console.error('Error loading clients:', error)
    })
  };

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: (error) => console.error('Error loading vehicles:', error)
    })
  }

  loadRevenues(): void {
    this.reservationDetaisService.getReservationDetails().subscribe({
      next: (data) => {this.reservationDetails = data
        this.reservationDetails.map( (reservation) => {
          this.revenues += reservation.cost
        })
      },
      error: (error) => console.error('Error loading revenues:', error)
    })
  }

  countActiveClients(): void {
    this.activeClients = 0;
    this.inactiveClients = 0;
    this.clients.forEach(client => {
      if(client.isActive === true)
        this.activeClients += 1;
      else this.inactiveClients += 1;
    })
  }

  loadReservations(): void {
    this.reservationsService.getReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.sortedReservations = [...this.reservations];
        this.filteredClients = [...this.clients];
        this.filterTodayReservations();
        this.applyReservationsSorting();
      },
      error: (error) => console.error('Error loading reservations:', error)
    })
  }

  filterTodayReservations(): void {
    const now = new Date();
    
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    this.sortedReservations = this.reservations.filter(reservation => {
      if (reservation.date === currentDate) {
        const [hourStr, minuteStr] = reservation.time.split(':');
        const reservationHour = parseInt(hourStr, 10);
        const reservationMinute = parseInt(minuteStr, 10);
        
        const reservationTime = new Date(now);
        reservationTime.setHours(reservationHour, reservationMinute, 0, 0);
        
        return reservationTime >= now;
      }
      return false;
    });
  }

  applyReservationsSorting() {
    this.sortedReservations.sort((a,b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if(dateComparison === 0 ) return a.time.localeCompare(b.time);
      return dateComparison;
    })
  }

  goToReservation(reservationId: string): void {
    this.router.navigate(['reservation', reservationId])
  }

  goToClient(clientId: string): void {
    this.router.navigate(['clients', clientId]);
  }

  toggleClientStatus(event: Event, client: Client) {
    event.stopPropagation();
    client.isActive = !client.isActive;
    if (!client.isActive) {
      this.clientService.deactivateClient(client.id).subscribe(() => {
        this.countActiveClients();
      });
    } else {
      this.clientService.reactivateClient(client.id).subscribe(() => {
        this.countActiveClients();
      });
    }
  }
  
  applyCurrentFilter() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredClients = [...this.sortedClients];
      return;
    }
    
    const searchLower = this.searchTerm.toLowerCase().trim();
    
    this.filteredClients = this.sortedClients.filter(client => {
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const reverseName = `${client.lastName} ${client.firstName}`.toLowerCase();
      
      return fullName.includes(searchLower) || 
             reverseName.includes(searchLower) || 
             (client.email && client.email.toLowerCase().includes(searchLower)) ||
             (client.phone && client.phone.includes(searchLower));
    });
  }
  
  searchClients(value: string): void {
    this.searchTerm = value;
    this.applyCurrentFilter();
  }
}
