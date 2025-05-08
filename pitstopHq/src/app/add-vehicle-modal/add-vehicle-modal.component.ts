import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../models/vehicle';
import { v4 as uuid } from 'uuid';
import { VehicleService } from '../services/vehicle.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-vehicle-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-vehicle-modal.component.html',
  styleUrl: './add-vehicle-modal.component.scss'
})
export class AddVehicleModalComponent implements OnInit {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() saveVehicle = new EventEmitter<{ vehicle: Vehicle }>();

  vehicleForm!: FormGroup;
  submitted = false;
  currentYear!: number;
  engineTypes = ["Diesel", 'Gas', 'Hybrid', 'Electric'];

  constructor(private formBuilder: FormBuilder,
              private vehicleService: VehicleService,
              private route: ActivatedRoute) {}

  ngOnInit(): void{
    this.currentYear = new Date().getFullYear();
    this.initForm();
  }

  initForm(): void {
    this.vehicleForm = this.formBuilder.group({
      make: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]*$/)]],
      model: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]*$/)]],
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
    if(!isNaN(hp)) {
      const kw = Math.round(hp * 0.7355);
      this.vehicleForm.get('kwPower')?.setValue(kw, { emitEvent: false })
    }
  }

  onKwPowerChange(event: any): void {
    const kw = parseFloat(event.target.value);
    if(!isNaN(kw)) {
      const hp = Math.round(kw / 0.7355);
      this.vehicleForm.get('horsePower')?.setValue(hp, { emitEvent: false })
    }
  }

  get vf() {
    return this.vehicleForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if(this.vehicleForm.invalid) return;

    const clientId = this.route.snapshot.paramMap.get('id')!;
    const vehicleId = uuid();

    const vehicleData: Vehicle = {
      ...this.vehicleForm.value,
      id: vehicleId,
      clientId: clientId
    }

    this.vehicleService.addVehicle(vehicleData).subscribe({
      next: (result) => {
        this.saveVehicle.emit({ vehicle: result });
        this.closeModal();
        this.resetForm();
      }
    })
  }

  closeModal(): void {
    this.close.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.submitted = false;
    this.vehicleForm.reset();
  }
}
