import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../data/data.service';
import { SliderComponent } from '../slider/slider.component';
import { WorldMapComponent } from '../world-map/world-map.component';
import { YearService } from '../year.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [WorldMapComponent, SliderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(SliderComponent) sliderComponent: SliderComponent<number>;

  availableYears: number[] = [];
  currentYear: number = this.yearService.getYear();

  private sliderSubscription: Subscription;

  constructor(private dataService: DataService, private yearService: YearService) {}

  ngOnInit(): void {
    this.getAvailableYears().then((years) => {
      this.availableYears = years;
    });
  }

  ngAfterViewInit(): void {
    this.sliderSubscription = this.sliderComponent.value$.subscribe((year: number) => {
      this.yearService.setYear(year);
      this.currentYear = year;
    });
  }

  ngOnDestroy(): void {
    this.sliderSubscription.unsubscribe();
  }

  public async getAvailableYears(): Promise<number[]> {
    const seasons = await this.dataService.getSeasons();
    return Array.from(seasons.keys()).sort();
  }
}
