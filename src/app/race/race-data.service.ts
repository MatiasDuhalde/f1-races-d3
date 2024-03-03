import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data/data.service';
import { Circuit, Driver, Race, Result } from '../data/types';
import { YearService } from '../year.service';

export type Segment = {
  // The number of the lap of the pit stop
  number: number;
  // The lap associated with the segment
  lap: number;
  // The start millisecond of the segment
  start: number;
  // The duration (in milliseconds) of the segment
  milliseconds: number;
  // A string representation of the duration
  durString: string;
  // The type of the segment
  type: 'lap' | 'pitstop';
  // The position of the driver at the end of the segment
  position?: number;
};

export type DriverResult = Driver & {
  totalSegmentDuration: number;
  segments: Segment[];
  result: Result | null;
  status: string;
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

  private selectedDriverSource = new BehaviorSubject<DriverResult | null>(null);
  selectedDriver$ = this.selectedDriverSource.asObservable();

  private availableYears: number[] = [];
  private raceDrivers: Map<number, Driver> = new Map();
  private raceResults: Result[] = [];

  private loading = false;

  constructor(private dataService: DataService, private yearService: YearService) {
    this.yearService.year$.subscribe(() => {
      this.loading = true;
      this.updateRace()
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    });
  }

  public async setCircuit(circuit: Circuit | null): Promise<void> {
    this.circuitSource.next(circuit);
    this.loading = true;
    await this.updateAvailableYears();
    await this.updateRace();
    this.loading = false;
  }

  public async setSelectedDriver(driver: DriverResult | null): Promise<void> {
    this.selectedDriverSource.next(driver);
  }

  public isLoading(): boolean {
    return this.loading;
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
    const race = this.raceSource.getValue();

    if (race === null) {
      this.raceDataSource.next([]);
      return;
    }

    const raceLapTimes = await this.dataService.getLapTimesByRaceId(race.raceId);
    const racePitStops = await this.dataService.getPitStopsByRaceId(race.raceId);
    const statuses = await this.dataService.getStatuses();

    const data = Array.from(this.raceDrivers.values()).map((driver) => {
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

      const lapTimeSegments: Segment[] = driverLapTimes.map((lapTime) => ({
        number: lapTime.lap,
        lap: lapTime.lap,
        start: 0,
        milliseconds: lapTime.milliseconds,
        durString: lapTime.time,
        type: 'lap',
        position: lapTime.position,
      }));

      const pitStopSegments: Segment[] = driverPitStops.map((pitStop) => ({
        number: pitStop.stop,
        lap: pitStop.lap,
        start: 0,
        milliseconds: pitStop.milliseconds,
        durString: pitStop.duration,
        type: 'pitstop',
        position: undefined,
      }));

      const segments = lapTimeSegments.concat(pitStopSegments).sort((a, b) => {
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

      let totalSegmentDuration = segments.length > 0 ? segments[0].milliseconds : 0;
      for (let i = 1; i < segments.length; i++) {
        if (segments[i].type === 'pitstop') {
          segments[i].start =
            segments[i - 1].start + segments[i - 1].milliseconds - segments[i].milliseconds;
        } else {
          totalSegmentDuration += segments[i].milliseconds;
          segments[i].start = segments[i - 1].start + segments[i - 1].milliseconds;
        }
      }

      const result = this.raceResults.find((res) => res.driverId === driver.driverId) ?? null;
      const status = result ? statuses.get(result.statusId) ?? '' : '';

      return {
        ...driver,
        segments,
        totalSegmentDuration,
        result,
        status,
      };
    });

    this.raceDataSource.next(data);
  }

  public isLapTime(entry: Segment) {
    return entry.type === 'lap';
  }

  public isPitStop(entry: Segment) {
    return entry.type === 'pitstop';
  }
}
