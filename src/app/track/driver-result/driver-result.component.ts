import { Component, Input } from '@angular/core';
import { Driver, Result } from '../../data/types';

@Component({
  selector: 'app-driver-result',
  standalone: true,
  imports: [],
  templateUrl: './driver-result.component.html',
  styleUrl: './driver-result.component.scss',
})
export class DriverResultComponent {
  @Input() driver: Driver;
  @Input() result: Result;

  constructor() {}
}
