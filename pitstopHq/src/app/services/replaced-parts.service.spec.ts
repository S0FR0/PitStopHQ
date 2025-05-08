import { TestBed } from '@angular/core/testing';

import { ReplacedPartsService } from './replaced-parts.service';

describe('ReplacedPartsService', () => {
  let service: ReplacedPartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplacedPartsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
