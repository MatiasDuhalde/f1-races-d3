import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../data/data.service';
import { Circuit, Driver, Race, Result } from '../data/types';
import { SliderComponent } from '../slider/slider.component';
import { YearService } from '../year.service';
import { DriverResultComponent } from './driver-result/driver-result.component';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule, SliderComponent, DriverResultComponent],
  templateUrl: './track.component.html',
  styleUrl: './track.component.scss',
})
export class TrackComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(SliderComponent) sliderComponent: SliderComponent<number>;

  circuit: Circuit | undefined = undefined;
  race: Race | undefined = undefined;
  drivers: Map<number, Driver> = new Map();
  results: Result[] = [];

  availableYears: number[] = [];
  currentYear: number = this.yearService.getYear();

  private sliderSubscription: Subscription;

  constructor(
    private dataService: DataService,
    private yearService: YearService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const parsedId = id ? parseInt(id, 10) : undefined;

    (async () => {
      if (parsedId === undefined || isNaN(parsedId)) {
        this.availableYears = [];
        return;
      }

      this.circuit = await this.dataService.getCircuitById(parsedId);
      this.availableYears = await this.getAvailableYears();
      await this.updateRace();
    })();
  }

  ngAfterViewInit(): void {
    this.sliderSubscription = this.sliderComponent.value$.subscribe((year: number) => {
      this.yearService.setYear(year);
      this.currentYear = year;
      this.updateRace();
    });
  }

  ngOnDestroy(): void {
    this.sliderSubscription.unsubscribe();
  }

  public async goHome(): Promise<void> {
    await this.router.navigate(['home']);
  }

  private async updateRace(): Promise<void> {
    if (!this.circuit) {
      this.race = undefined;
      this.drivers = new Map();
      this.results = [];
      return;
    }

    this.race = await this.dataService.getRaceByCircuitIdAndYear(
      this.circuit.circuitId,
      this.currentYear,
    );

    if (this.race !== undefined) {
      this.drivers = await this.dataService.getDriversByRaceId(this.race.raceId);
      const res = await this.dataService.getResultsByRaceId(this.race.raceId);
      this.results = Array.from(res.values()).sort((a, b) => a.positionOrder - b.positionOrder);
    }
  }

  public async getAvailableYears(): Promise<number[]> {
    if (!this.circuit) {
      return [];
    }
    const races = await this.dataService.getRacesByCircuitId(this.circuit.circuitId);

    return Array.from(races.values())
      .map((race) => race.year)
      .sort();
  }
}
