import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuantityModalComponent } from './add-quantity-modal.component';

describe('AddQuantityModalComponent', () => {
  let component: AddQuantityModalComponent;
  let fixture: ComponentFixture<AddQuantityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQuantityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddQuantityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
