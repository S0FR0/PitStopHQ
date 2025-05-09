import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../models/client';
import { Vehicle } from '../models/vehicle';
import { v4 as uuid } from 'uuid';
import { ClientService } from '../services/client.service';
import { VehicleService } from '../services/vehicle.service';
import { switchMap, map } from 'rxjs';

@Component({
  selector: 'app-add-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-client-modal.component.html',
  styleUrl: './add-client-modal.component.scss'
})
export class AddClientModalComponent implements OnInit {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() saveClient = new EventEmitter<{client: Client; vehicle: Vehicle}>();

  clientForm!: FormGroup;
  vehicleForm!: FormGroup;
  submitted = false;
  currentStep = 1;
  currentYear!: number;
  engineTypes = ['Diesel', 'Gas', 'Hybrid', 'Electric'];

  constructor(private formBuilder: FormBuilder,
              private clientServer: ClientService,
              private vehiclesService: VehicleService) {}

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.initForms();
  }

  initForms(): void {
    this.clientForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Z][a-zA-Z-]*$/)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Z][a-zA-Z]*$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      secondaryPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true],
      date: [new Date()],
      vehicleCount: [1]
    });

    this.vehicleForm = this.formBuilder.group({
      make: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z-]*$/)]],
      model: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z-]*$/)]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      licensePlate: ['', [Validators.required, Validators.pattern(/^([A-Z]{1})-(\d{3})-([A-Z]{3})|([A-Z]{2})-(\d{2})-([A-Z]{3})$/)]],
      chassisNumber: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17), Validators.pattern(/^[A-Z0-9]*$/)]],
      engineType: ['diesel', Validators.required],
      engineCapacity: ['', [Validators.required, Validators.min(0), Validators.max(10000)]],
      horsePower: ['', [Validators.required, Validators.min(0), Validators.max(2000)]],
      kwPower: ['', [Validators.required, Validators.min(0), Validators.max(1500)]],
      km: ['', [Validators.required, Validators.min(0), Validators.max(10000000)]]
    });
  }

  onHorsePowerChange(event: any): void {
    const hp = parseFloat(event.target.value);
    if (!isNaN(hp)) {
      const kw = Math.round(hp * 0.7355);
      this.vehicleForm.get('kwPower')?.setValue(kw, { emitEvent: false });
    }
  }
  
  onKwPowerChange(event: any): void {
    const kw = parseFloat(event.target.value);
    if (!isNaN(kw)) {
      const hp = Math.round(kw / 0.7355);
      this.vehicleForm.get('horsePower')?.setValue(hp, { emitEvent: false });
    }
  }

  get cf() {
    return this.clientForm.controls;
  }

  get vf() {
    return this.vehicleForm.controls;
  }

  nextStep(): void {
    this.submitted = true;
    if (this.clientForm.invalid) return;

    this.currentStep = 2;
    this.submitted = false;
  }

  prevStep(): void {
    this.currentStep = 1;
    this.submitted = false;
  }

  onSubmit(): void {
    this.submitted = true;
  
    if (this.vehicleForm.invalid) {      
      return;
    }
    
    const clientId = uuid();
    const vehicleId = uuid();
    
    const clientData: Client = {
      ...this.clientForm.value,
      id: clientId
    };
    
    const vehicleData: Vehicle = {
      ...this.vehicleForm.value,
      id: vehicleId,
      clientId: clientId
    };

    this.clientServer.addClient(clientData).pipe(
      switchMap((savedClient) => {
        return this.vehiclesService.addVehicle(vehicleData).pipe(
          map((savedVehicle) => ({ client: savedClient, vehicle: savedVehicle }))
        );
      })
    ).subscribe({
      next: (result) => {
        this.saveClient.emit(result);
        this.closeModal();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error saving data:', error);
      }
    });
  }

  closeModal(): void {
    this.close.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.submitted = false;
    this.currentStep = 1;
    this.clientForm.reset({
      isActive: true,
      date: new Date(),
      vehicleCount: 0
    });
    this.vehicleForm.reset();
  }
}