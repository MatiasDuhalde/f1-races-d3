import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Driver } from '../../data/types';
import { RaceDataService } from '../race-data.service';

@Component({
  selector: 'app-driver-iframe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-iframe.component.html',
  styleUrl: './driver-iframe.component.scss',
})
export class DriverIframeComponent {
  driver: Driver | null = null;

  constructor(private raceDataService: RaceDataService, private domSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.raceDataService.selectedDriver$.subscribe((driver) => {
      this.driver = driver;
      console.log(this.driver);
    });
  }

  getUrl() {
    if (this.driver === null) {
      return '';
    }
    return this.domSanitizer.bypassSecurityTrustResourceUrl(this.driver.url);
  }

  getMobileUrl() {
    if (this.driver === null) {
      return '';
    }
    return this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.driver.url.replace('wikipedia', 'm.wikipedia'),
    );
  }
}
