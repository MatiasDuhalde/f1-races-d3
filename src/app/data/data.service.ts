import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import {
  parseCircuit,
  parseDriver,
  parseLapTime,
  parsePitStop,
  parseRace,
  parseResult,
  parseSeason,
} from './parse';
import type { Circuit, Driver, LapTime, PitStop, Race, Result, Season } from './types';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private static readonly BASE_PATH =
    'https://raw.githubusercontent.com/MatiasDuhalde/f1-races-d3/master/data/';
  private static readonly F1_PREFIX = 'f1/';
  private static readonly GEO_PREFIX = 'geo/';
  private static readonly TRACKS_PREFIX = 'tracks/';
  private static readonly CSV_EXTENSION = '.csv';
  private static readonly JSON_EXTENSION = '.json';
  private static readonly SVG_EXTENSION = '.svg';

  private static readonly CIRCUITS_PATH =
    DataService.BASE_PATH + DataService.F1_PREFIX + 'circuits' + DataService.CSV_EXTENSION;
  private static readonly DRIVERS_PATH =
    DataService.BASE_PATH + DataService.F1_PREFIX + 'drivers' + DataService.CSV_EXTENSION;
  private static readonly RACES_PATH =
    DataService.BASE_PATH + DataService.F1_PREFIX + 'races' + DataService.CSV_EXTENSION;
  private static readonly SEASONS_PATH =
    DataService.BASE_PATH + DataService.F1_PREFIX + 'seasons' + DataService.CSV_EXTENSION;
  private static readonly RESULTS_PATH =
    DataService.BASE_PATH + DataService.F1_PREFIX + 'results' + DataService.CSV_EXTENSION;

  // private static readonly CONSTRUCTOR_RESULTS_PATH =
  //   DataService.BASE_PATH + 'constructor_results' + DataService.CSV_EXTENSION;
  // private static readonly CONSTRUCTOR_STANDINGS_PATH =
  //   DataService.BASE_PATH + 'constructor_standings' + DataService.CSV_EXTENSION;
  // private static readonly CONSTRUCTORS_PATH = DataService.BASE_PATH + 'constructors' + DataService.CSV_EXTENSION;
  // private static readonly DRIVER_STANDINGS_PATH =
  //   DataService.BASE_PATH + 'driver_standings' + DataService.CSV_EXTENSION;
  private static readonly LAP_TIMES_PATH =
    DataService.BASE_PATH + DataService.F1_PREFIX + 'lap_times' + DataService.CSV_EXTENSION;
  private static readonly PIT_STOPS_PATH =
    DataService.BASE_PATH + DataService.F1_PREFIX + 'pit_stops' + DataService.CSV_EXTENSION;
  // private static readonly QUALIFYING_PATH = DataService.BASE_PATH + 'qualifying' + DataService.CSV_EXTENSION;
  // private static readonly SPRINT_RESULTS_PATH =
  //   DataService.BASE_PATH + 'sprint_results' + DataService.CSV_EXTENSION;
  private static readonly STATUS_PATH =
    DataService.BASE_PATH + DataService.F1_PREFIX + 'status' + DataService.CSV_EXTENSION;

  private static readonly WORLD_MAP_PATH =
    DataService.BASE_PATH + DataService.GEO_PREFIX + 'world_map' + DataService.JSON_EXTENSION;

  private static instance: DataService;

  // cache
  private circuits: Map<number, Circuit> = new Map();
  private drivers: Map<number, Driver> = new Map();
  private seasons: Map<number, Season> = new Map();
  private races: Map<number, Race> = new Map();
  private results: Result[] = [];
  private lapTimes: LapTime[] = [];
  private pitStops: PitStop[] = [];
  private statuses: Map<number, string> = new Map();

  private worldMap: d3.ExtendedFeatureCollection | undefined = undefined;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async getCircuits(): Promise<Map<number, Circuit>> {
    if (this.circuits.size === 0) {
      const result = await d3.csv(DataService.CIRCUITS_PATH);
      result.map(parseCircuit).forEach((d) => this.circuits.set(d.circuitId, d));
    }
    return this.circuits;
  }

  public async getCircuitById(circuitId: number): Promise<Circuit | undefined> {
    const circuits = await this.getCircuits();
    return circuits.get(circuitId);
  }

  public async getCircuitsByYear(year: number): Promise<Map<number, Circuit>> {
    let races = await this.getRacesByYear(year);
    const circuits = await this.getCircuits();
    return new Map([...races].map(([_, race]) => [race.circuitId, circuits.get(race.circuitId)!]));
  }

  public async getDrivers(): Promise<Map<number, Driver>> {
    if (this.drivers.size === 0) {
      const result = await d3.csv(DataService.DRIVERS_PATH);
      result.map(parseDriver).forEach((d) => this.drivers.set(d.driverId, d));
    }
    return this.drivers;
  }

  public async getDriversByRaceId(raceId: number): Promise<Map<number, Driver>> {
    const results = await this.getResultsByRaceId(raceId);
    const drivers = await this.getDrivers();
    return new Map(results.map((result) => [result.driverId, drivers.get(result.driverId)!]));
  }

  public async getSeasons(): Promise<Map<number, Season>> {
    if (this.seasons.size === 0) {
      const result = await d3.csv(DataService.SEASONS_PATH);
      result.map(parseSeason).forEach((d) => this.seasons.set(d.year, d));
    }
    return this.seasons;
  }

  public async getRaces(): Promise<Map<number, Race>> {
    if (this.races.size === 0) {
      const result = await d3.csv(DataService.RACES_PATH);
      result.map(parseRace).forEach((d) => this.races.set(d.raceId, d));
    }
    return this.races;
  }

  public async getRacesByYear(year: number): Promise<Map<number, Race>> {
    const races = await this.getRaces();
    return new Map([...races].filter(([_, race]) => race.year === year));
  }

  public async getRacesByCircuitId(circuitId: number): Promise<Map<number, Race>> {
    const races = await this.getRaces();

    return new Map([...races].filter(([_, race]) => race.circuitId === circuitId));
  }

  public async getRaceByCircuitIdAndYear(
    circuitId: number,
    year: number,
  ): Promise<Race | undefined> {
    const races = await this.getRaces();
    for (let [_, race] of races) {
      if (race.circuitId === circuitId && race.year === year) {
        return race;
      }
    }
    return undefined;
  }

  public async getResults(): Promise<Result[]> {
    if (this.results.length === 0) {
      const result = await d3.csv(DataService.RESULTS_PATH);
      this.results = result.map(parseResult);
    }
    return this.results;
  }

  public async getResultsByRaceId(raceId: number): Promise<Result[]> {
    const results = await this.getResults();
    return results.filter((result) => result.raceId === raceId);
  }

  public async getLapTimes(): Promise<LapTime[]> {
    if (this.lapTimes.length === 0) {
      const result = await d3.csv(DataService.LAP_TIMES_PATH);
      this.lapTimes = result.map(parseLapTime);
    }
    return this.lapTimes;
  }

  public async getLapTimesByRaceId(raceId: number): Promise<LapTime[]> {
    const lapTimes = await this.getLapTimes();
    return lapTimes.filter((lapTime) => lapTime.raceId === raceId);
  }

  public async getPitStops(): Promise<PitStop[]> {
    if (this.pitStops.length === 0) {
      const result = await d3.csv(DataService.PIT_STOPS_PATH);
      this.pitStops = result.map(parsePitStop);
    }
    return this.pitStops;
  }

  public async getPitStopsByRaceId(raceId: number): Promise<PitStop[]> {
    const pitStops = await this.getPitStops();
    return pitStops.filter((pitStop) => pitStop.raceId === raceId);
  }

  public async getStatuses(): Promise<Map<number, string>> {
    if (this.statuses.size === 0) {
      const result = await d3.csv(DataService.STATUS_PATH);
      result.forEach((d) => this.statuses.set(+d['statusId'], d['status']));
    }
    return this.statuses;
  }

  public async getStatus(statusId: number): Promise<string> {
    const statuses = await this.getStatuses();
    return statuses.get(statusId) || '';
  }

  public async getWorldMapGeoJson(): Promise<d3.ExtendedFeatureCollection> {
    if (this.worldMap === undefined) {
      this.worldMap = (await d3.json(DataService.WORLD_MAP_PATH)) as d3.ExtendedFeatureCollection;
    }
    return this.worldMap;
  }

  private getCircuitSvgPath(circuitRef: string): string {
    return (
      DataService.BASE_PATH + DataService.TRACKS_PREFIX + circuitRef + DataService.SVG_EXTENSION
    );
  }

  public async getTrackSvg(circuitRef: string): Promise<HTMLElement> {
    const xml = await d3.xml(this.getCircuitSvgPath(circuitRef));
    return xml.documentElement;
  }
}
