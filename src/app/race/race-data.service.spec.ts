import { TestBed } from '@angular/core/testing';

import { RaceDataService } from './race-data.service';

describe('RaceDataService', () => {
  let service: RaceDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RaceDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
