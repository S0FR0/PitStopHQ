import { TestBed } from '@angular/core/testing';

import { VehicleConditionService } from './vehicle-condition.service';

describe('VehicleConditionService', () => {
  let service: VehicleConditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleConditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
