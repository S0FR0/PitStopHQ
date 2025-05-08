import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PartService } from '../services/part.service';

@Component({
  selector: 'app-add-quantity-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-quantity-modal.component.html',
  styleUrl: './add-quantity-modal.component.scss'
})
export class AddQuantityModalComponent implements OnInit {
  @Input() show = false;
  @Input() partId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() quantityUpdate = new EventEmitter<{ partId: string, quantity: number}>();

  quantityForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder,
              private partService: PartService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.quantityForm = this.formBuilder.group({
      quantity: [0]
    })
  }

  onSubmit(): void {
    if (this.quantityForm.valid) {
      const quantityToAdd = this.quantityForm.value.quantity;
      this.partService.addPart(this.partId, quantityToAdd)
      this.quantityUpdate.emit();
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.quantityForm.reset({
      quantity: 0
    })
  }

}
