import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../data/data.service';
import { Circuit, Driver, Race, Result } from '../data/types';
import { SliderComponent } from '../slider/slider.component';
import { YearService } from '../year.service';
import { DriverIframeComponent } from './driver-iframe/driver-iframe.component';
import { LapsOverviewComponent } from './laps-overview/laps-overview.component';
import { RaceDataService } from './race-data.service';

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [CommonModule, SliderComponent, LapsOverviewComponent, DriverIframeComponent],
  templateUrl: './race.component.html',
  styleUrl: './race.component.scss',
})
export class RaceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(SliderComponent) sliderComponent: SliderComponent<number>;

  circuit: Circuit | null = null;
  race: Race | null = null;
  drivers: Map<number, Driver> = new Map();
  results: Result[] = [];

  availableYears: number[] = [];
  currentYear: number = this.yearService.getYear();

  private sliderSubscription: Subscription;
  private circuitSubscription: Subscription;
  private raceSubscription: Subscription;

  constructor(
    private dataService: DataService,
    private yearService: YearService,
    private raceDataService: RaceDataService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const parsedId = id ? parseInt(id, 10) : undefined;

    if (parsedId === undefined || isNaN(parsedId)) {
      this.availableYears = [];
      return;
    }

    (async () => {
      const circuit = (await this.dataService.getCircuitById(parsedId)) || null;
      await this.raceDataService.setCircuit(circuit);
      this.availableYears = this.raceDataService.getAvailableYears();
    })();

    this.circuitSubscription = this.raceDataService.circuit$.subscribe((circuit) => {
      this.circuit = circuit;
    });

    this.raceSubscription = this.raceDataService.race$.subscribe((race) => {
      this.race = race;
    });
  }

  ngAfterViewInit(): void {
    this.sliderSubscription = this.sliderComponent.value$.subscribe((year: number) => {
      this.yearService.setYear(year);
    });
  }

  ngOnDestroy(): void {
    this.sliderSubscription.unsubscribe();
    this.circuitSubscription.unsubscribe();
    this.raceSubscription.unsubscribe();
  }

  public async goHome(): Promise<void> {
    await this.router.navigate(['home']);
  }
}
