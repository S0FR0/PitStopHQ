import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReservationModalComponent } from './edit-reservation-modal.component';

describe('EditReservationModalComponent', () => {
  let component: EditReservationModalComponent;
  let fixture: ComponentFixture<EditReservationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditReservationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditReservationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
