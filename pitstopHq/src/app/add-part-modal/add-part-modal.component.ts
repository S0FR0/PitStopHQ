import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Part } from '../models/part';
import { v4 as uuid } from 'uuid';
import { PartService } from '../services/part.service';

@Component({
  selector: 'app-add-part-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-part-modal.component.html',
  styleUrl: './add-part-modal.component.scss'
})
export class AddPartModalComponent implements OnInit {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() savePart = new EventEmitter<{ part: Part }>();

  partForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder,
              private partService: PartService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.partForm = this.formBuilder.group({
      name: ['', Validators.required],
      partNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]*$/)]],
      price: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      stockQuantity: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]]
    });
  }

  get pf() {
    return this.partForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.partForm.invalid) return;

    const partId = uuid();

    const partData: Part = {
      ...this.partForm.value,
      id: partId
    };

    this.partService.createPart(partData).subscribe({
      next: (data) => {
        this.savePart.emit({ part: data });
        this.closeModal();
        this.resetForm();
      }
    });
  }

  closeModal(): void {
    this.close.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.submitted = false;
    this.partForm.reset();
  }
}