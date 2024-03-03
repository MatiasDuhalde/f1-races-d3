import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DriverResult, RaceDataService } from '../race-data.service';

@Component({
  selector: 'app-driver-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-info.component.html',
  styleUrl: './driver-info.component.scss',
})
export class DriverInfoComponent {
  driver: DriverResult | null = null;

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

  public msToTime(ms: number): string {
    return new Date(ms).toISOString().slice(11, -1);
  }
}
