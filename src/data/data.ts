import * as d3 from 'd3';
import type { Circuit, Driver, Race, Season } from './types';
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
  // private static readonly RESULTS_PATH = this.BASE_PATH + 'results' + this.CSV_EXTENSION;
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
        fp1Date: dateOrUndefined(d.fp1Date),
        fp1Time: stringOrUndefined(d.fp1Time),
        fp2Date: dateOrUndefined(d.fp2Date),
        fp2Time: stringOrUndefined(d.fp2Time),
        fp3Date: dateOrUndefined(d.fp3Date),
        fp3Time: stringOrUndefined(d.fp3Time),
        qualiDate: dateOrUndefined(d.qualiDate),
        qualiTime: stringOrUndefined(d.qualiTime),
        sprintDate: dateOrUndefined(d.sprintDate),
        sprintTime: stringOrUndefined(d.sprintTime),
      }));
    }
    return this.races;
  }

  public async getWorldMapGeoJson(): Promise<d3.ExtendedFeatureCollection> {
    if (this.worldMap === undefined) {
      this.worldMap = (await d3.json(DataService.WORLD_MAP_PATH)) as d3.ExtendedFeatureCollection;
    }
    return this.worldMap;
  }
}
