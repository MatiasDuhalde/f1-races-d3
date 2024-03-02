import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data/data.service';
import { Circuit, Driver, LapTime, PitStop, Race, Result } from '../data/types';
import { YearService } from '../year.service';

export type DriverLapData = (LapTime | PitStop) & { start: number };

export type DriverResult = Driver & {
  duration: number;
  data: DriverLapData[];
};

@Injectable({
  providedIn: 'root',
})
export class RaceDataService {
  private circuitSource = new BehaviorSubject<Circuit | null>(null);
  circuit$ = this.circuitSource.asObservable();

  private raceSource = new BehaviorSubject<Race | null>(null);
  race$ = this.raceSource.asObservable();

  private raceDataSource = new BehaviorSubject<DriverResult[]>([]);
  raceData$ = this.raceDataSource.asObservable();

  private availableYears: number[] = [];
  private raceDrivers: Map<number, Driver> = new Map();
  private raceResults: Result[] = [];

  constructor(private dataService: DataService, private yearService: YearService) {
    this.yearService.year$.subscribe(() => this.updateRace());
  }

  public async setCircuit(circuit: Circuit | null): Promise<void> {
    this.circuitSource.next(circuit);
    await this.updateAvailableYears();
    await this.updateRace();
  }

  private async updateRace(): Promise<void> {
    const circuit = this.circuitSource.getValue();

    if (circuit === null) {
      this.raceDrivers = new Map();
      this.raceResults = [];
      this.raceSource.next(null);
      this.raceDataSource.next([]);
      return;
    }

    const currentYear = this.yearService.getYear();

    const race =
      (await this.dataService.getRaceByCircuitIdAndYear(circuit.circuitId, currentYear)) ?? null;

    if (race !== null) {
      this.raceDrivers = await this.dataService.getDriversByRaceId(race.raceId);
      const res = await this.dataService.getResultsByRaceId(race.raceId);
      this.raceResults = Array.from(res.values()).sort((a, b) => a.positionOrder - b.positionOrder);
    }

    this.raceSource.next(race);

    await this.buildData();
  }

  public getAvailableYears(): number[] {
    return this.availableYears;
  }

  public async updateAvailableYears(): Promise<void> {
    const circuit = this.circuitSource.getValue();
    if (!circuit) {
      this.availableYears = [];
    } else {
      const races = await this.dataService.getRacesByCircuitId(circuit.circuitId);

      this.availableYears = Array.from(races.values())
        .map((race) => race.year)
        .sort();
    }
  }

  private async buildData() {
    const race = this.raceSource.getValue()!;

    const raceLapTimes = await this.dataService.getLapTimesByRaceId(race.raceId);
    const racePitStops = await this.dataService.getPitStopsByRaceId(race.raceId);
    const raceDrivers = await this.dataService.getDriversByRaceId(race.raceId);

    const data = Array.from(raceDrivers.values()).map((driver) => {
      const driverLapTimes = raceLapTimes
        .filter((lapTime) => {
          return lapTime.driverId == driver.driverId;
        })
        .map((lapTime) => {
          return {
            ...lapTime,
            start: 0,
          };
        });
      const driverPitStops = racePitStops
        .filter((pitStop) => {
          return pitStop.driverId == driver.driverId;
        })
        .map((pitStop) => {
          return {
            ...pitStop,
            start: 0,
          };
        });

      const data: DriverLapData[] = [...driverLapTimes];

      data.push(...driverPitStops);

      data.sort((a, b) => {
        const diff = a.lap - b.lap;
        if (diff == 0) {
          return (
            +this.isLapTime(a) * 1 +
            +this.isPitStop(a) * 2 -
            (+this.isLapTime(b) * 1 + +this.isPitStop(b) * 2)
          );
        }
        return diff;
      });

      let duration = data.length > 0 ? data[0].milliseconds : 0;
      for (let i = 0; i < data.length - 1; i++) {
        if (this.isLapTime(data[i + 1])) {
          duration += data[i + 1].milliseconds;
          // Le temps de début est le précédent + le temps du tour précédent
          data[i + 1].start = data[i].start + data[i].milliseconds;
        } else {
          data[i].milliseconds -= data[i + 1].milliseconds;
          // Ici il faut bien enlever le pitstop du tour (précédent dans la structure de donnée)
          data[i + 1].start = data[i].start + data[i].milliseconds;
        }
      }

      return {
        ...driver,
        data,
        duration,
      };
    });

    this.raceDataSource.next(data);
  }

  public isLapTime(entry: LapTime | PitStop) {
    return 'position' in entry;
  }

  public isPitStop(entry: LapTime | PitStop) {
    return 'stop' in entry;
  }
}
