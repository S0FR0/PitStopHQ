import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPartModalComponent } from './add-part-modal.component';

describe('AddPartModalComponent', () => {
  let component: AddPartModalComponent;
  let fixture: ComponentFixture<AddPartModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPartModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPartModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
