import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { ReservationDetails } from '../models/reservation-details';
import { VehicleCondition } from '../models/vehicle-condition';
import { Part } from '../models/part';
import { ReplacedPart } from '../models/replaced-part';
import { PartService } from '../services/part.service';
import { ReservationDetailsService } from '../services/reservation-details.service';
import { VehicleConditionService } from '../services/vehicle-condition.service';
import { ReplacedPartService } from '../services/replaced-parts.service';
import { ReservationService } from '../services/reservation.service';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-details-form.component.html',
  styleUrls: ['./reservation-details-form.component.scss']
})
export class ReservationDetailsFormComponent implements OnInit {
  @Output() detailsUpdated = new EventEmitter<ReservationDetails>();
  
  form!: FormGroup;
  submitted = false;
  
  reservationId: string = '';
  vehicleId: string = '';
  details: ReservationDetails | null = null;
  vehicleCondition: VehicleCondition | null = null;
  replacedParts: ReplacedPart[] = [];
  originalReplacedParts: ReplacedPart[] = [];
  availableParts: Part[] = [];
  
  isLoading = false;
  detailsExist = false;
  
  readonly baseCost = 50;
  readonly serviceTypes = ['Scheduled maintenance', 'Repair', 'Parts replacement', 'Diagnostics', 'Other'];
  readonly mechanics = ['Employee1', 'Employee2', 'Employee3', 'Employee4'];
  readonly timeOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private partService: PartService,
    private reservationService: ReservationService,
    private reservationDetailsService: ReservationDetailsService,
    private vehicleConditionService: VehicleConditionService,
    private replacedPartService: ReplacedPartService
  ) {}

  ngOnInit(): void {
    this.reservationId = this.route.snapshot.paramMap.get('reservationId')!;
    this.initializeForm();
    this.loadData();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      serviceType: ['', Validators.required],
      description: ['', Validators.required],
      cost: [this.baseCost, [Validators.required, Validators.min(0)]],
      duration: [10, Validators.required],
      mechanic: ['', Validators.required],
      notes: [''],
      partsNeeded: [''],
      currentKm: [0, [Validators.required, Validators.min(0)]],
      useParts: [false],
      
      vehicleCondition: this.fb.group({
        isDamaged: [false],
        damageDescription: [''],
        isScratched: [false],
        scratchDescription: [''],
        hasMechanicalIssues: [false],
        mechanicalIssuesDescription: [''],
        hasElectricalIssues: [false],
        electricalIssuesDescription: ['']
      }),
      
      replacedParts: this.fb.array([])
    });
    
    this.addPart();
    
    this.form.get('useParts')?.valueChanges.subscribe(useParts => {
      this.updateCost();
      if (useParts && this.partsArray.length === 0) {
        this.addPart();
      }
    });
    
    this.partsArray.valueChanges.subscribe(() => {
      this.updateCost();
    });
  }

  private loadData(): void {
    this.isLoading = true;
    
    this.partService.getAllParts().subscribe({
      next: (parts) => {
        this.availableParts = parts;
        this.loadReservationInfo();
      },
      error: (error) => {
        console.error('Error loading parts:', error);
        this.isLoading = false;
      }
    });
  }

  private loadReservationInfo(): void {
    this.reservationService.getReservation(this.reservationId).subscribe({
      next: (reservation) => {
        if (reservation?.vehicleId) {
          this.vehicleId = reservation.vehicleId;
        }
        this.loadReservationDetails();
      },
      error: (error) => {
        console.error('Error loading reservation:', error);
        this.loadReservationDetails();
      }
    });
  }

  private loadReservationDetails(): void {
    this.reservationDetailsService.getReservationDetailsByReservationId(this.reservationId).subscribe({
      next: (details) => {
        if (details) {
          this.details = details;
          this.detailsExist = true;
          this.loadVehicleCondition(details.vehicleConditionId);
          this.loadReplacedParts(details.id);
        } else {
          this.createNewDetailsObjects();
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading reservation details:', error);
        this.isLoading = false;
      }
    });
  }

  private loadVehicleCondition(conditionId: string): void {
    if (!conditionId) {
      if (this.details) {
        this.updateFormWithDetails(this.details);
      }
      return;
    }
    
    this.vehicleConditionService.getVehicleConditionById(conditionId).subscribe({
      next: (condition) => {
        this.vehicleCondition = condition;
        
        if (condition) {
          this.form.patchValue({
            vehicleCondition: {
              isDamaged: condition.isDamaged,
              damageDescription: condition.damageDescription || '',
              isScratched: condition.isScratched,
              scratchDescription: condition.scratchDescription || '',
              hasMechanicalIssues: condition.hasMechanicalIssues,
              mechanicalIssuesDescription: condition.mechanicalIssuesDescription || '',
              hasElectricalIssues: condition.hasElectricalIssues,
              electricalIssuesDescription: condition.electricalIssuesDescription || ''
            }
          });
        } else if (this.details) {
          this.createNewVehicleCondition(conditionId);
        }
      },
      error: (error) => {
        console.error('Error loading vehicle condition:', error);
        
        if (error.status === 404 && this.details) {
          this.createNewVehicleCondition(conditionId);
        } else if (this.details) {
          this.updateFormWithDetails(this.details);
        }
      }
    });
  }

  private loadReplacedParts(detailsId: string): void {
    this.replacedPartService.getReplacedPartsByReservationDetailsId(detailsId).subscribe({
      next: (parts) => {
        if (parts?.length > 0) {
          this.replacedParts = parts;
          this.originalReplacedParts = [...parts];
          
          this.form.patchValue({ useParts: true });
          
          while (this.partsArray.length > 0) {
            this.partsArray.removeAt(0);
          }
          
          parts.forEach(part => {
            this.addPartWithValues(part.partId, part.quantity);
          });
          this.addPart();
          this.updateCost();
        }
        
        if (this.details) {
          this.updateFormWithDetails(this.details);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading replaced parts:', error);
        if (this.details) {
          this.updateFormWithDetails(this.details);
        }
        this.isLoading = false;
      }
    });
  }

  private createNewDetailsObjects(): void {
    this.resetForm();
    
    const detailsId = uuid();
    const conditionId = uuid();
    
    this.details = {
      id: detailsId,
      reservationId: this.reservationId,
      serviceType: 'Scheduled maintenance',
      description: '',
      cost: this.baseCost,
      duration: 10,
      mechanic: '',
      notes: '',
      partsNeeded: '',
      currentKm: 0,
      vehicleConditionId: conditionId
    };
    
    this.vehicleCondition = {
      id: conditionId,
      reservationDetailsId: detailsId,
      isDamaged: false,
      damageDescription: '',
      isScratched: false,
      scratchDescription: '',
      hasMechanicalIssues: false,
      mechanicalIssuesDescription: '',
      hasElectricalIssues: false,
      electricalIssuesDescription: ''
    };
    
    this.replacedParts = [];
    this.originalReplacedParts = [];
    this.detailsExist = false;
  }

  private createNewVehicleCondition(conditionId: string): void {
    if (!this.details) return;
    
    this.vehicleCondition = {
      id: conditionId,
      reservationDetailsId: this.details.id,
      isDamaged: false,
      damageDescription: '',
      isScratched: false,
      scratchDescription: '',
      hasMechanicalIssues: false,
      mechanicalIssuesDescription: '',
      hasElectricalIssues: false,
      electricalIssuesDescription: ''
    };
    this.updateFormWithDetails(this.details);
  }

  private updateFormWithDetails(details: ReservationDetails): void {
    this.form.patchValue({
      serviceType: details.serviceType || '',
      description: details.description || '',
      cost: details.cost || this.baseCost,
      duration: details.duration || 10,
      mechanic: details.mechanic || '',
      notes: details.notes || '',
      partsNeeded: details.partsNeeded || '',
      currentKm: details.currentKm || 0
    });
  }

  get partsArray(): FormArray {
    return this.form.get('replacedParts') as FormArray;
  }

  addPart(): void {
    const partForm = this.fb.group({
      partId: [''],
      quantity: [1, [Validators.min(1)]]
    });
    this.partsArray.push(partForm);
    const lastIndex = this.partsArray.length - 1;
    this.partsArray.at(lastIndex).get('partId')?.valueChanges.subscribe(value => {
      if (value && lastIndex === this.partsArray.length - 1) {
        this.addPart();
      }
    });
  }

  addPartWithValues(partId: string, quantity: number): void {
    this.partsArray.push(this.fb.group({
      partId: [partId, Validators.required],
      quantity: [quantity, [Validators.min(1)]]
    }));
  }

  removePart(index: number): void {
    this.partsArray.removeAt(index);
    if (this.partsArray.length === 0) {
      this.addPart();
    } else {
      const lastIndex = this.partsArray.length - 1;
      const lastPartId = this.partsArray.at(lastIndex).get('partId')?.value;
      if (lastPartId) {
        this.addPart();
      }
    }
    this.updateCost();
  }

  getAvailablePartsForRow(currentIndex: number): Part[] {
    if (!this.availableParts?.length || this.partsArray.length === 0) {
      return this.availableParts || [];
    }
    const selectedPartIds: string[] = [];
    for (let i = 0; i < this.partsArray.length; i++) {
      if (i === currentIndex) continue;
      const partId = this.partsArray.at(i).get('partId')?.value;
      if (partId) {
        selectedPartIds.push(partId);
      }
    }

    return this.availableParts.filter(part => !selectedPartIds.includes(part.id));
  }

  getPart(partId: string): Part | undefined {
    return this.availableParts.find(p => p.id === partId);
  }

  getPartName(partId: string): string {
    const part = this.getPart(partId);
    return part ? part.name : 'Unknown Part';
  }

  getPartPrice(partId: string): number {
    const part = this.getPart(partId);
    return part ? part.price : 0;
  }

  calculatePartTotal(index: number): number {
    const partForm = this.partsArray.at(index) as FormGroup;
    if (!partForm) return 0;
    
    const partId = partForm.get('partId')?.value;
    if (!partId) return 0;
    
    const quantity = partForm.get('quantity')?.value || 1;
    return this.getPartPrice(partId) * quantity;
  }

  calculatePartsTotal(): number {
    let total = 0;
    for (let i = 0; i < this.partsArray.length; i++) {
      const partId = this.partsArray.at(i).get('partId')?.value;
      if (partId) {
        total += this.calculatePartTotal(i);
      }
    }
    return total;
  }

  calculateTotalWithBasePrice(): number {
    const useParts = this.form.get('useParts')?.value || false;
    const partsTotal = useParts ? this.calculatePartsTotal() : 0;
    return this.baseCost + partsTotal;
  }

  updateCost(): void {
    this.form.patchValue(
      { cost: this.calculateTotalWithBasePrice() }, 
      { emitEvent: false }
    );
  }

  cleanupPartsArray(): void {
    for (let i = this.partsArray.length - 1; i >= 0; i--) {
      const partId = this.partsArray.at(i).get('partId')?.value;
      if (!partId) {
        this.partsArray.removeAt(i);
      }
    }
    
    if (this.partsArray.length === 0 && this.form.get('useParts')?.value) {
      this.addPart();
    }
  }

  resetForm(): void {
    this.submitted = false;
    this.form.reset({
      serviceType: '',
      description: '',
      cost: this.baseCost,
      duration: 10,
      mechanic: '',
      notes: '',
      partsNeeded: '',
      currentKm: 0,
      useParts: false,
      vehicleCondition: {
        isDamaged: false,
        damageDescription: '',
        isScratched: false,
        scratchDescription: '',
        hasMechanicalIssues: false,
        mechanicalIssuesDescription: '',
        hasElectricalIssues: false,
        electricalIssuesDescription: ''
      }
    });
    
    while (this.partsArray.length > 0) {
      this.partsArray.removeAt(0);
    }
    this.addPart();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.saveReservationDetails().pipe(
      switchMap(details => this.saveVehicleCondition(details.id).pipe(
        switchMap(condition => {
          if (details.vehicleConditionId !== condition.id) {
            details.vehicleConditionId = condition.id;
            return this.reservationDetailsService.updateReservationDetails(details).pipe(
              switchMap(() => this.saveReplacedParts(details.id))
            );
          } else {
            return this.saveReplacedParts(details.id);
          }
        }),
        switchMap(() => this.updateVehicleMileage())
      )),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.loadReservationDetails();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error saving reservation details:', error);
      }
    });
  }

  private saveReservationDetails(): Observable<ReservationDetails> {
    const formData = this.form.value;
    const detailsId = this.details?.id || uuid();
    const conditionId = this.vehicleCondition?.id || uuid();
    
    const details: ReservationDetails = {
      id: detailsId,
      reservationId: this.reservationId,
      serviceType: formData.serviceType,
      description: formData.description,
      cost: formData.cost,
      duration: formData.duration,
      mechanic: formData.mechanic,
      notes: formData.notes,
      partsNeeded: formData.partsNeeded,
      currentKm: formData.currentKm,
      vehicleConditionId: conditionId
    };
    
    if (this.detailsExist) {
      return this.reservationDetailsService.updateReservationDetails(details);
    } else {
      return this.reservationDetailsService.createReservationDetails(details);
    }
  }

  private saveVehicleCondition(detailsId: string): Observable<VehicleCondition> {
    const conditionData = this.form.get('vehicleCondition')?.value;
    const conditionId = this.vehicleCondition?.id || uuid();
    
    const condition: VehicleCondition = {
      id: conditionId,
      reservationDetailsId: detailsId,
      ...conditionData
    };
    
    if (this.detailsExist && this.vehicleCondition) {
      return this.vehicleConditionService.updateVehicleCondition(condition);
    } else {
      return this.vehicleConditionService.createVehicleCondition(condition);
    }
  }

  private saveReplacedParts(detailsId: string): Observable<any> {
    const useParts = this.form.get('useParts')?.value || false;
    
    if (!useParts) {
      return this.updatePartsInventory([], this.originalReplacedParts).pipe(
        switchMap(() => this.replacedPartService.deleteReplacedPartsByReservationDetailsId(detailsId))
      );
    }
    
    this.cleanupPartsArray();
    const formParts = this.partsArray.value;
    
    const partsToUpdate: ReplacedPart[] = [];
    const partsToCreate: ReplacedPart[] = [];
    const finalPartsList: ReplacedPart[] = [];
    
    formParts.forEach((formPart: any) => {
      if (!formPart.partId) return;

      const existingPart = this.originalReplacedParts.find(
        part => part.partId === formPart.partId
      );
      
      if (existingPart) {
        if (existingPart.quantity !== formPart.quantity) {
          const updatedPart = {
            ...existingPart,
            quantity: formPart.quantity
          };
          partsToUpdate.push(updatedPart);
          finalPartsList.push(updatedPart);
        } else {
          finalPartsList.push(existingPart);
        }
      } else {
        const newPart = {
          id: uuid(),
          reservationDetailsId: detailsId,
          partId: formPart.partId,
          quantity: formPart.quantity
        };
        partsToCreate.push(newPart);
        finalPartsList.push(newPart);
      }
    });
    
    const partsToDelete = this.originalReplacedParts.filter(originalPart => 
      !formParts.some((formPart: any) => formPart.partId === originalPart.partId)
    );
    
    return this.updatePartsInventory(finalPartsList, this.originalReplacedParts).pipe(
      switchMap(() => {
        const operations: Observable<any>[] = [];
        partsToDelete.forEach(part => {
          operations.push(this.replacedPartService.deleteReplacedPart(part.id));
        });
        partsToUpdate.forEach(part => {
          operations.push(this.replacedPartService.updateReplacedPart(part));
        });
        partsToCreate.forEach(part => {
          operations.push(this.replacedPartService.createReplacedPart(part));
        });
        this.originalReplacedParts = [...finalPartsList];
        return operations.length > 0 ? forkJoin(operations) : of(null);
      })
    );
  }

  private updateVehicleMileage(): Observable<any> {
    if (!this.vehicleId) {
      return of(null);
    }
    
    const currentKm = this.form.get('currentKm')?.value;
    if (currentKm === undefined || currentKm === null) {
      return of(null);
    }
    
    return of({ vehicleId: this.vehicleId, currentKm });
  }

  private updatePartsInventory(newParts: ReplacedPart[], oldParts: ReplacedPart[]): Observable<any> {
    const partChanges: Record<string, number> = {};
    
    for (const part of oldParts) {
      partChanges[part.partId] = (partChanges[part.partId] || 0) + part.quantity;
    }
    
    for (const part of newParts) {
      partChanges[part.partId] = (partChanges[part.partId] || 0) - part.quantity;
    }
    
    for (const partId in partChanges) {
      const change = partChanges[partId];
      if (change !== 0) {
        this.partService.addPart(partId, change);
      }
    }
  
    return of(null);
  }

  get formControls() {
    return this.form.controls;
  }

  get vehicleConditionForm(): FormGroup {
    return this.form.get('vehicleCondition') as FormGroup;
  }
}