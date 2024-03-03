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
    });
  }

  getUrl() {
    if (this.driver === null) {
      return '';
    }
    let url = this.transformToHttps(this.driver.url);
    url = this.transformToMobileUrl(url);

    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private transformToHttps(url: string) {
    return url.replace('http://', 'https://');
  }

  private transformToMobileUrl(url: string) {
    return url.replace('wikipedia', 'm.wikipedia');
  }
}
