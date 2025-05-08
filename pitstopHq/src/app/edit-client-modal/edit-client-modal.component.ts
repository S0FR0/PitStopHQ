import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Component({
  selector: 'app-edit-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-client-modal.component.html',
  styleUrl: './edit-client-modal.component.scss'
})
export class EditClientModalComponent implements OnInit, OnChanges {
  @Input() show = false;
  @Input() clientId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() clientUpdated = new EventEmitter<Client>();

  clientForm!: FormGroup;
  submitted = false;
  clientData!: Client; 

  constructor(private formBuilder: FormBuilder,
              private clientService: ClientService) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && changes['show'].currentValue === true) {
      this.resetForm();
      if (this.clientId) {
        this.loadClientData();
      }
    } else if (changes['clientId'] && changes['clientId'].currentValue) {
      if (this.clientId && this.show) {
        this.loadClientData();
      }
    }
  }

  initForm(): void {
    this.clientForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Z][a-zA-Z]*$/)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Z][a-zA-Z]*$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      secondaryPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true],
      date: [new Date()],
      vehicleCount: [1]
    })
  }

  loadClientData(): void {
    this.clientService.getClientById(this.clientId).subscribe({
      next: (data) => {
        this.clientData = data;
        this.populateFormWithData();
      },
      error: (error) => console.error("Client data didn't load:", error)
    })
  }

  populateFormWithData(): void {
    if( this.clientData ) {
      this.clientForm.patchValue({
        firstName: this.clientData.firstName,
        lastName: this.clientData.lastName,
        phone: this.clientData.phone,
        secondaryPhone: this.clientData.secondaryPhone || '',
        email: this.clientData.email,
        isActive: this.clientData.isActive,
        date: this.clientData.date,
        vehicleCount: this.clientData.vehicleCount
      })
    }
  }

  get cf() {
     return this.clientForm.controls; 
  }

  onSubmit(): void {
    this.submitted = true;

    if(this.clientForm.invalid || !this.clientData) return

    const clientUpdates: Partial<Client> = {
      ...this.clientForm.value
    }

    this.clientService.updateClient(this.clientId, clientUpdates).subscribe({
      next: (result) => {
        this.clientUpdated.emit(result)
        this.closeModal()
      },
      error: (error) => console.error('Error updating data:', error)
    })
  }

  closeModal(): void {
    this.close.emit();
  }
  resetForm(): void {
    this.submitted = false;
    this.clientForm.reset({
      isActive: true,
      date: new Date(),
      vehicleCount: 1
    });
  }
}
