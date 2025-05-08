import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartService } from '../services/part.service';
import { Part } from '../models/part';
import { MatIconModule } from '@angular/material/icon';
import { AddPartModalComponent } from '../add-part-modal/add-part-modal.component';
import { AddQuantityModalComponent } from '../add-quantity-modal/add-quantity-modal.component';
import { MatIcon } from '@angular/material/icon';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-parts',
  imports: [
    CommonModule, 
    MatIconModule, 
    AddPartModalComponent, 
    AddQuantityModalComponent, 
    MatIcon,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './parts.component.html',
  styleUrl: './parts.component.scss'
})
export class PartsComponent {
  
  parts: Part[] = [];
  showCreateModal = false;
  showAddModal = false;
  selectedPartId: string = '';
  
  showDeleteModal = false;
  deletePartId: string = '';

  constructor(private partService: PartService) {}

  ngOnInit(): void {
    this.loadParts();
  }

  loadParts(): void {
    this.partService.getAllParts().subscribe({
      next: (data) => {
        this.parts = data;
      },
      error: (error) => console.error('Error loading parts:', error)
    })
  }

  openCreateModal() {
    this.showCreateModal = true;
  }
  
  openAddModal(partId: string) {
    console.log('Opening modal for part:', partId);
    this.selectedPartId = partId;
    this.showAddModal = true;
    console.log('showAddModal is now:', this.showAddModal);
  }

  closeModal() {
    this.showCreateModal = false;
    this.showAddModal = false;
    this.showDeleteModal = false;
  }

  onSaveNewPart(event: { part: Part }) {
    this.partService.createPart(event.part);
    this.loadParts();
  }

  onQuantityUpdate() {
    setTimeout(() => {
      this.loadParts();
    }, 100);
  }

  confirmDeletePart(partId: string) {
    this.deletePartId = partId;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.deletePartId = '';
  }

  confirmDelete() {
    this.showDeleteModal = false;
    if (this.deletePartId) {
      this.partService.deletePart(this.deletePartId).subscribe({
        next: () => {
          this.loadParts();
        },
        error: (error) => {
          console.error('Error deleting part', error);
        }
      });
      this.deletePartId = '';
    }
  }

  deletePart(partId: string) {
    if(confirm('Are you sure you want to delete?')){
      this.partService.deletePart(partId).subscribe({
        next: () => {
          this.loadParts();
        },
        error: (error) => {
          console.error('Error deleting part', error);
        }
      })
    }
  }
}