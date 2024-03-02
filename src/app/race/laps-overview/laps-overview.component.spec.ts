import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LapsOverviewComponent } from './laps-overview.component';

describe('LapsOverviewComponent', () => {
  let component: LapsOverviewComponent;
  let fixture: ComponentFixture<LapsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LapsOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LapsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
