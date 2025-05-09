import { Component, EventEmitter, Input, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-edit-vehicle-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-vehicle-modal.component.html',
  styleUrl: './edit-vehicle-modal.component.scss'
})
export class EditVehicleComponent {

  @Input() show = false;
  @Input() vehicleId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() vehicleUpdated = new EventEmitter<Vehicle>();

  vehicleForm!: FormGroup;
  submitted = false;
  vehicleData!: Vehicle;
  engineTypes = ['Diesel', 'Gas', 'Hybrid', 'Electric'];

  constructor(private formBuilder: FormBuilder,
              private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && changes['show'].currentValue === true) {
      if (this.vehicleId) {
        this.loadVehicleData();
      }
    }
    else if (changes['vehicleId'] && changes['vehicleId'].currentValue) {
      if (this.vehicleId) this.loadVehicleData();
    }
  }

  initForm(): void {
    this.vehicleForm = this.formBuilder.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      licensePlate: ['', [Validators.required, Validators.pattern(/^([A-Z]{1})-(\d{3})-([A-Z]{3})|([A-Z]{2})-(\d{2})-([A-Z]{3})$/)]],
      chassisNumber: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
      engineType: ['diesel', Validators.required],
      engineCapacity: ['', [Validators.required, Validators.min(0), Validators.max(10000)]],
      horsePower: ['', [Validators.required, Validators.min(0), Validators.max(2000)]],
      kwPower: ['', [Validators.required, Validators.min(0), Validators.max(1500)]],
      km: ['', [Validators.required, Validators.min(0), Validators.max(10000000)]]
    });
  }

  loadVehicleData(): void {
    this.vehicleService.getVehicleById(this.vehicleId).subscribe({
      next: (data) => {
        this.vehicleData = data;
        this.populateFormWithData();
      },
      error: (error) => console.error("Error loading vehicle data:", error)
    })
  }

  populateFormWithData(): void {
    if( this.vehicleData ) {
      this.vehicleForm.patchValue({
        make: this.vehicleData.make,
        model: this.vehicleData.model,
        year: this.vehicleData.year,
        licensePlate: this.vehicleData.licensePlate,
        chassisNumber: this.vehicleData.chassisNumber,
        engineType: this.vehicleData.engineType,
        engineCapacity: this.vehicleData.engineCapacity,
        horsePower: this.vehicleData.horsePower,
        kwPower: this.vehicleData.kwPower,
        km: this.vehicleData.km
      })
    }
  }

  get vf() {
    return this.vehicleForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if(this.vehicleForm.invalid || !this.vehicleData) return

    const vehicleUpdates: Partial<Vehicle> = {
      ...this.vehicleForm.value,
      clientId: this.vehicleData.clientId
    }

    this.vehicleService.updateVehicle(this.vehicleId, vehicleUpdates).subscribe({
      next: (result) => {
        this.vehicleUpdated.emit(result)
        this.closeModal()
      },
      error: (error) => console.error('Error updating data:', error)
    })
  }

  closeModal(): void {
    this.close.emit();
    this.resetForm()
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

  resetForm(): void {
    this.submitted = false;
    this.vehicleForm.reset()
  }
}
