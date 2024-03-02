import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverIframeComponent } from './driver-iframe.component';

describe('DriverIframeComponent', () => {
  let component: DriverIframeComponent;
  let fixture: ComponentFixture<DriverIframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverIframeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
