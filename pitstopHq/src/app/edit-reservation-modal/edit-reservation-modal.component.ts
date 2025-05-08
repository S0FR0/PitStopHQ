// edit-reservation-modal.component.ts
import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reservation } from '../models/reservation';
import { Client } from '../models/client';
import { Vehicle } from '../models/vehicle';
import { TimeSlot } from '../models/time-slot';
import { Availability } from '../models/availability';
import { ReservationService } from '../services/reservation.service';
import { ClientService } from '../services/client.service';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-edit-reservation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-reservation-modal.component.html',
  styleUrl: './edit-reservation-modal.component.scss'
})
export class EditReservationModalComponent implements OnInit {
  
  @Input() show = false;
  @Input() reservationId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Reservation>();

  reservationForm!: FormGroup;
  clients: Client[] = [];
  availableDates: Availability[] = [];
  selectedDateSlots: TimeSlot[] = [];
  contactMethods: { value: string, display: string }[] = [];
  clientVehicles: Vehicle[] = [];
  submitted: boolean = false;
  currentReservation: Reservation | null = null;
  isLoading: boolean = false;
  
  originalDate: string = '';
  originalTime: string = '';

  constructor(
    private formBuilder: FormBuilder, 
    private reservationService: ReservationService, 
    private clientService: ClientService, 
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    
    this.reservationForm.get('clientId')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        this.onClientSelected(clientId);
      } else {
        this.clientVehicles = [];
        this.contactMethods = [];
        this.reservationForm.get('vehicleId')?.setValue('');
        this.reservationForm.get('contactMethod')?.setValue('');
      }
    });

    this.reservationForm.get('date')?.valueChanges.subscribe(date => {
      if(date) {
        this.updateTimeSlots(date);
      } else {
        this.selectedDateSlots = [];
      }
    });
  }

  ngOnChanges(): void {
    if (this.show && this.reservationId) {
      this.loadReservationData();
    }
  }

  openModal(reservationId: string): void {
    this.reservationId = reservationId;
    this.show = true;
    this.submitted = false;
    this.loadReservationData();
  }

  closeModal(): void {
    this.show = false;
    this.close.emit();
    this.submitted = false;
    this.reservationForm.reset();
    this.currentReservation = null;
  }

  initForm(): void {
    this.reservationForm = this.formBuilder.group({
      clientId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      contactMethod: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      title: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z ]*$/)]]
    });
  }

  get rf() {
    return this.reservationForm.controls;
  }

  loadReservationData(): void {
    if (!this.reservationId) return;
    
    this.isLoading = true;
    
    this.reservationService.getReservation(this.reservationId).subscribe({
      next: (reservation) => {
        this.currentReservation = reservation;
        this.originalDate = reservation.date;
        this.originalTime = reservation.time;
        
        this.loadAvailableDates(reservation);
        
        this.onClientSelected(reservation.clientId);
        
        this.reservationForm.patchValue({
          clientId: reservation.clientId,
          title: reservation.title,
          contactMethod: reservation.contactMethod,
          date: reservation.date,
          time: reservation.time
        });
        
        setTimeout(() => {
          this.reservationForm.patchValue({
            vehicleId: reservation.vehicleId
          });
          this.isLoading = false;
        }, 500);
      },
      error: (error: any) => {
        console.error('Error loading reservation:', error)
        this.isLoading = false;
      }
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  loadAvailableDates(currentReservation?: Reservation): void {
    const now = new Date();
    
    this.reservationService.getReservations().subscribe({
      next: (reservations) => {
        const availabilityMap = new Map<string, Availability>();
  
        for(let i = 0; i < 14; i++) {
          const currentDate = new Date();
          currentDate.setDate(currentDate.getDate() + i);
          
          if(currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            continue;
          }
  
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
          
          const slots: TimeSlot[] = [];
  
          for(let hour = 8; hour < 17; hour++) {
            for(let minute = 0; minute < 60; minute += 30) {
              
              const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              const timeDisplay = `${hour}:${minute.toString().padStart(2, '0')}`;
              
              const slotDate = new Date(currentDate);
              slotDate.setHours(hour, minute, 0, 0);
              
              const isInPast = slotDate < now;
              
              const isBooked = reservations.some(res => 
                res.date === dateStr && 
                res.time === timeValue && 
                (!currentReservation || res.id !== currentReservation.id)
              );
              const isCurrentReservationSlot = 
                currentReservation !== undefined && 
                currentReservation !== null &&
                dateStr === currentReservation.date && 
                timeValue === currentReservation.time;
              
              const isAvailable: boolean = (!isBooked && !isInPast) || Boolean(isCurrentReservationSlot);
  
              slots.push({
                value: timeValue,
                display: timeDisplay,
                available: isAvailable
              });
            }
          }
  
          const hasAvailableSlots = slots.some(slot => slot.available);
          const isCurrentReservationDate = 
            currentReservation !== undefined && 
            currentReservation !== null &&
            dateStr === currentReservation.date;
          
          if (hasAvailableSlots || isCurrentReservationDate) {
            availabilityMap.set(dateStr, {
              date: dateStr,
              slots,
              hasAvailableSlots: hasAvailableSlots || Boolean(isCurrentReservationDate)
            });
          }
        }
  
        this.availableDates = Array.from(availabilityMap.values());
        
        const currentDate = this.reservationForm.get('date')?.value;
        if (currentDate) {
          this.updateTimeSlots(currentDate);
        }
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
      }
    });
  }

  onClientSelected(clientId: string): void {
    const selectedClient = this.clients.find(client => client.id === clientId);

    if(selectedClient) {
      this.vehicleService.getVehiclesByClient(clientId).subscribe({
        next: (vehicles) => {
          this.clientVehicles = vehicles;
        },
        error: (error) => console.error('Error loading vehicles:', error)
      });

      this.contactMethods = [];

      if(selectedClient.email) {
        this.contactMethods.push({ value: `${selectedClient.email}`, display: `${selectedClient.email}` });
      }

      if(selectedClient.phone) {
        this.contactMethods.push({value: `${selectedClient.phone}`, display: `Phone: ${selectedClient.phone}`});
      }

      if(selectedClient.secondaryPhone) {
        this.contactMethods.push({value: `${selectedClient.secondaryPhone}`, display: `${selectedClient.secondaryPhone}`});
      }
    }
  }

  updateTimeSlots(dateStr: string): void {
    const selectedDate = this.availableDates.find(day => day.date === dateStr);
    this.selectedDateSlots = selectedDate ? selectedDate.slots.filter(slot => slot.available) : [];
  }

  onSubmit(): void {
    this.submitted = true;
    if(this.reservationForm.invalid || !this.currentReservation) return;
    
    const formData = this.reservationForm.value;

    const updates: Partial<Reservation> = {
      clientId: formData.clientId,
      vehicleId: formData.vehicleId,
      title: formData.title,
      contactMethod: formData.contactMethod,
      date: formData.date,
      time: formData.time
    };

    this.isLoading = true;
    this.reservationService.updateReservation(this.reservationId, updates).subscribe({
      next: (response) => {
        this.updated.emit(response);
        this.closeModal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating reservation:', error);
        this.isLoading = false;
      }
    });
  }
}