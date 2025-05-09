import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reservation } from '../models/reservation';
import { Client } from '../models/client';
import { Vehicle } from '../models/vehicle';
import { TimeSlot } from '../models/time-slot';
import { Availability } from '../models/availability';
import { v4 as uuid } from 'uuid';
import { ReservationService } from '../services/reservation.service';
import { ClientService } from '../services/client.service';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-reservation-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-form-modal.component.html',
  styleUrl: './reservation-form-modal.component.scss'
})
export class ReservationFormModalComponent implements OnInit {
  
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Reservation>();

  reservationForm!: FormGroup;
  clients: Client[] = [];
  availableDates: Availability[] = [];
  selectedDateSlots: TimeSlot[] = [];
  contactMethods: { value: string, display: string }[] = [];
  clientVehicles: Vehicle[] = [];
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder, 
    private reservationService: ReservationService, 
    private clientService: ClientService, 
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadAvailableDates();
    
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

  openModal(): void {
    this.show = true;
    this.submitted = false;
    this.reservationForm.reset();
    this.loadAvailableDates();
  }

  closeModal(): void {
    this.show = false;
    this.close.emit();
    this.submitted = false;
    this.reservationForm.reset();
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

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  loadAvailableDates(): void {
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
              if(hour === 16 && minute === 30) {
                continue;
              }
              
              const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              const timeDisplay = `${hour}:${minute.toString().padStart(2, '0')}`;
              
              const slotDate = new Date(currentDate);
              slotDate.setHours(hour, minute, 0, 0);
              
              const isInPast = slotDate < now;
              
              const isBooked = reservations.some(res => 
                res.date === dateStr && 
                res.time === timeValue
              );
              
              if (isBooked) {
              }
              
              if (isInPast) {
              }
  
              const isAvailable = !isBooked && !isInPast;
  
              slots.push({
                value: timeValue,
                display: timeDisplay,
                available: isAvailable
              });
            }
          }
  
          const hasAvailableSlots = slots.some(slot => slot.available);
          
          if (hasAvailableSlots) {
            availabilityMap.set(dateStr, {
              date: dateStr,
              slots,
              hasAvailableSlots
            });
          }
        }
  
        this.availableDates = Array.from(availabilityMap.values());
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
        this.contactMethods.push({value: `${selectedClient.phone}`, display: `${selectedClient.phone}`});
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
    if(this.reservationForm.invalid) return;
    
    const formData = this.reservationForm.value;

    const reservation: Reservation = {
      id: uuid(),
      clientId: formData.clientId,
      vehicleId: formData.vehicleId,
      title: formData.title,
      contactMethod: formData.contactMethod,
      date: formData.date,
      time: formData.time
    };

    this.reservationService.createReservation(reservation).subscribe({
      next: (response) => {
        this.saved.emit(response);
        this.closeModal();
        this.loadAvailableDates();
      },
      error: (error) => console.error('Error creating reservation:', error)
    });
  }
}