import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { parseCircuit, parseDriver, parseRace, parseResult, parseSeason } from './parse';
import type { Circuit, Driver, Race, Result, Season } from './types';

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
  // private static readonly LAP_TIMES_PATH = DataService.BASE_PATH + 'lap_times' + DataService.CSV_EXTENSION;
  // private static readonly PIT_STOPS_PATH = DataService.BASE_PATH + 'pit_stops' + DataService.CSV_EXTENSION;
  // private static readonly QUALIFYING_PATH = DataService.BASE_PATH + 'qualifying' + DataService.CSV_EXTENSION;
  // private static readonly SPRINT_RESULTS_PATH =
  //   DataService.BASE_PATH + 'sprint_results' + DataService.CSV_EXTENSION;
  // private static readonly STATUS_PATH = DataService.BASE_PATH + 'status' + DataService.CSV_EXTENSION;

  private static readonly WORLD_MAP_PATH =
    DataService.BASE_PATH + DataService.GEO_PREFIX + 'world_map' + DataService.JSON_EXTENSION;

  private static instance: DataService;

  // cache
  private circuits: Map<number, Circuit> = new Map();
  private drivers: Map<number, Driver> = new Map();
  private seasons: Map<number, Season> = new Map();
  private races: Map<number, Race> = new Map();
  private results: Map<number, Result> = new Map();
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
    return new Map(
      [...results].map(([_, result]) => [result.driverId, drivers.get(result.driverId)!]),
    );
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

  public async getResults(): Promise<Map<number, Result>> {
    if (this.results.size === 0) {
      const result = await d3.csv(DataService.RESULTS_PATH);
      result.map(parseResult).forEach((d) => this.results.set(d.resultId, d));
    }
    return this.results;
  }

  public async getResultsByRaceId(raceId: number): Promise<Map<number, Result>> {
    const results = await this.getResults();
    return new Map([...results].filter(([_, result]) => result.raceId === raceId));
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
