import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationDetailsFormComponent } from './reservation-details-form.component';

describe('ReservationDetailsFormComponent', () => {
  let component: ReservationDetailsFormComponent;
  let fixture: ComponentFixture<ReservationDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationDetailsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
