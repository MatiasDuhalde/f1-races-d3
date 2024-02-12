import * as d3 from 'd3';
import type { Circuit, Driver, Race, Result, Season } from './types';
import { dateOrUndefined, numberOrUndefined, stringOrUndefined } from './utils';

export class DataService {
  private static readonly BASE_PATH =
    'https://raw.githubusercontent.com/MatiasDuhalde/f1-races-d3/master/data/';
  private static readonly F1_PREFIX = 'f1/';
  private static readonly GEO_PREFIX = 'geo/';
  private static readonly CSV_EXTENSION = '.csv';
  private static readonly JSON_EXTENSION = '.json';

  private static readonly CIRCUITS_PATH =
    this.BASE_PATH + this.F1_PREFIX + 'circuits' + this.CSV_EXTENSION;
  private static readonly DRIVERS_PATH =
    this.BASE_PATH + this.F1_PREFIX + 'drivers' + this.CSV_EXTENSION;
  private static readonly RACES_PATH =
    this.BASE_PATH + this.F1_PREFIX + 'races' + this.CSV_EXTENSION;
  private static readonly SEASONS_PATH =
    this.BASE_PATH + this.F1_PREFIX + 'seasons' + this.CSV_EXTENSION;
  private static readonly RESULTS_PATH =
    this.BASE_PATH + this.F1_PREFIX + 'results' + this.CSV_EXTENSION;

  // private static readonly CONSTRUCTOR_RESULTS_PATH =
  //   this.BASE_PATH + 'constructor_results' + this.CSV_EXTENSION;
  // private static readonly CONSTRUCTOR_STANDINGS_PATH =
  //   this.BASE_PATH + 'constructor_standings' + this.CSV_EXTENSION;
  // private static readonly CONSTRUCTORS_PATH = this.BASE_PATH + 'constructors' + this.CSV_EXTENSION;
  // private static readonly DRIVER_STANDINGS_PATH =
  //   this.BASE_PATH + 'driver_standings' + this.CSV_EXTENSION;
  // private static readonly LAP_TIMES_PATH = this.BASE_PATH + 'lap_times' + this.CSV_EXTENSION;
  // private static readonly PIT_STOPS_PATH = this.BASE_PATH + 'pit_stops' + this.CSV_EXTENSION;
  // private static readonly QUALIFYING_PATH = this.BASE_PATH + 'qualifying' + this.CSV_EXTENSION;
  // private static readonly SPRINT_RESULTS_PATH =
  //   this.BASE_PATH + 'sprint_results' + this.CSV_EXTENSION;
  // private static readonly STATUS_PATH = this.BASE_PATH + 'status' + this.CSV_EXTENSION;

  private static readonly WORLD_MAP_PATH =
    this.BASE_PATH + this.GEO_PREFIX + 'world_map' + this.JSON_EXTENSION;

  private static instance: DataService;

  // cache
  private circuits: Circuit[] | undefined = undefined;
  private drivers: Driver[] | undefined = undefined;
  private seasons: Season[] | undefined = undefined;
  private races: Race[] | undefined = undefined;
  private results: Result[] | undefined = undefined;
  private worldMap: d3.ExtendedFeatureCollection | undefined = undefined;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async getCircuits(): Promise<Circuit[]> {
    if (this.circuits === undefined) {
      const result = await d3.csv(DataService.CIRCUITS_PATH);
      this.circuits = result.map((d) => ({
        circuitId: +d.circuitId,
        circuitRef: d.circuitRef,
        name: d.name,
        location: d.location,
        country: d.country,
        lat: +d.lat,
        lng: +d.lng,
        alt: numberOrUndefined(d.alt),
        url: d.url,
      }));
    }
    return this.circuits;
  }

  public async getDrivers(): Promise<Driver[]> {
    if (this.drivers === undefined) {
      const result = await d3.csv(DataService.DRIVERS_PATH);
      this.drivers = result.map((d) => ({
        driverId: +d.driverId,
        driverRef: d.driverRef,
        number: numberOrUndefined(d.number),
        code: stringOrUndefined(d.code),
        forename: d.forename,
        surname: d.surname,
        dob: new Date(d.dob),
        nationality: d.nationality,
        url: d.url,
      }));
    }
    return this.drivers;
  }

  public async getSeasons(): Promise<Season[]> {
    if (this.seasons === undefined) {
      const result = await d3.csv(DataService.SEASONS_PATH);
      this.seasons = result.map((d) => ({
        year: +d.year,
        url: d.url,
      }));
    }
    return this.seasons;
  }

  public async getRaces(): Promise<Race[]> {
    if (this.races === undefined) {
      const result = await d3.csv(DataService.RACES_PATH);
      this.races = result.map((d) => ({
        raceId: +d.raceId,
        year: +d.year,
        round: +d.round,
        circuitId: +d.circuitId,
        name: d.name,
        date: new Date(d.date),
        time: stringOrUndefined(d.time),
        url: d.url,
        fp1Date: dateOrUndefined(d.fp1_date),
        fp1Time: stringOrUndefined(d.fp1_time),
        fp2Date: dateOrUndefined(d.fp2_date),
        fp2Time: stringOrUndefined(d.fp2_time),
        fp3Date: dateOrUndefined(d.fp3_date),
        fp3Time: stringOrUndefined(d.fp3_time),
        qualiDate: dateOrUndefined(d.quali_date),
        qualiTime: stringOrUndefined(d.quali_time),
        sprintDate: dateOrUndefined(d.sprint_date),
        sprintTime: stringOrUndefined(d.sprint_time),
      }));
    }
    return this.races;
  }

  public async getResults(): Promise<Result[]> {
    if (this.results === undefined) {
      const result = await d3.csv(DataService.RESULTS_PATH);
      this.results = result.map((d) => ({
        resultId: +d.resultId,
        raceId: +d.raceId,
        driverId: +d.driverId,
        constructorId: +d.constructorId,
        number: numberOrUndefined(d.number),
        grid: +d.grid,
        position: numberOrUndefined(d.position),
        positionText: d.positionText,
        positionOrder: +d.positionOrder,
        points: +d.points,
        laps: +d.laps,
        time: stringOrUndefined(d.time),
        milliseconds: numberOrUndefined(d.milliseconds),
        fastestLap: numberOrUndefined(d.fastestLap),
        rank: numberOrUndefined(d.rank),
        fastestLapTime: stringOrUndefined(d.fastestLapTime),
        fastestLapSpeed: numberOrUndefined(d.fastestLapSpeed),
        statusId: +d.statusId,
      }));
    }
    return this.results;
  }

  public async getRacesByYear(year: number) {
    const races = await this.getRaces();
    return races.filter((race) => race.year === year);
  }

  public async getRaceByYearAndCircuitId(
    year: number,
    circuitId: number,
  ): Promise<Race | undefined> {
    const races = await this.getRaces();
    return races.find((race) => race.circuitId === circuitId && race.year === year);
  }

  public async getCircuitsByYear(year: number): Promise<Circuit[]> {
    let races = await this.getRacesByYear(year);
    const circuits = await this.getCircuits();
    return circuits.filter((circuit) => races.some((race) => race.circuitId === circuit.circuitId));
  }

  public async getWorldMapGeoJson(): Promise<d3.ExtendedFeatureCollection> {
    if (this.worldMap === undefined) {
      this.worldMap = (await d3.json(DataService.WORLD_MAP_PATH)) as d3.ExtendedFeatureCollection;
    }
    return this.worldMap;
  }
}
