import { TestBed } from '@angular/core/testing';

import { ReservationDetailsService } from './reservation-details.service';

describe('ReservationDetailsService', () => {
  let service: ReservationDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservationDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
