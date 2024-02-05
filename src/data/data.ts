import * as d3 from 'd3';
import type { Circuit, Driver, Season } from './types';
import { numberOrUndefined, stringOrUndefined } from './utils';

export class DataService {
  private static readonly BASE_PATH = '/data/f1/';
  private static readonly CSV_EXTENSION = '.csv';

  private static readonly CIRCUITS_PATH = this.BASE_PATH + 'circuits' + this.CSV_EXTENSION;
  private static readonly CONSTRUCTOR_RESULTS_PATH =
    this.BASE_PATH + 'constructor_results' + this.CSV_EXTENSION;
  private static readonly CONSTRUCTOR_STANDINGS_PATH =
    this.BASE_PATH + 'constructor_standings' + this.CSV_EXTENSION;
  private static readonly CONSTRUCTORS_PATH = this.BASE_PATH + 'constructors' + this.CSV_EXTENSION;
  private static readonly DRIVER_STANDINGS_PATH =
    this.BASE_PATH + 'driver_standings' + this.CSV_EXTENSION;
  private static readonly DRIVERS_PATH = this.BASE_PATH + 'drivers' + this.CSV_EXTENSION;
  private static readonly LAP_TIMES_PATH = this.BASE_PATH + 'lap_times' + this.CSV_EXTENSION;
  private static readonly PIT_STOPS_PATH = this.BASE_PATH + 'pit_stops' + this.CSV_EXTENSION;
  private static readonly QUALIFYING_PATH = this.BASE_PATH + 'qualifying' + this.CSV_EXTENSION;
  private static readonly RACES_PATH = this.BASE_PATH + 'races' + this.CSV_EXTENSION;
  private static readonly RESULTS_PATH = this.BASE_PATH + 'results' + this.CSV_EXTENSION;
  private static readonly SEASONS_PATH = this.BASE_PATH + 'seasons' + this.CSV_EXTENSION;
  private static readonly SPRINT_RESULTS_PATH =
    this.BASE_PATH + 'sprint_results' + this.CSV_EXTENSION;
  private static readonly STATUS_PATH = this.BASE_PATH + 'status' + this.CSV_EXTENSION;

  private static instance: DataService;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async getCircuits(): Promise<Circuit[]> {
    const result = await d3.csv(DataService.CIRCUITS_PATH);
    return result.map((d) => {
      return {
        circuitId: +d.circuitId,
        circuitRef: d.circuitRef,
        name: d.name,
        location: d.location,
        country: d.country,
        lat: +d.lat,
        lng: +d.lng,
        alt: numberOrUndefined(d.alt),
        url: d.url,
      };
    });
  }

  public async getDrivers(): Promise<Driver[]> {
    const result = await d3.csv(DataService.DRIVERS_PATH);
    return result.map((d) => {
      return {
        driverId: +d.driverId,
        driverRef: d.driverRef,
        number: numberOrUndefined(d.number),
        code: stringOrUndefined(d.code),
        forename: d.forename,
        surname: d.surname,
        dob: new Date(d.dob),
        nationality: d.nationality,
        url: d.url,
      };
    });
  }

  public async getSeasons(): Promise<Season[]> {
    const result = await d3.csv(DataService.SEASONS_PATH);
    return result.map((d) => {
      return {
        year: +d.year,
        url: d.url,
      };
    });
  }

  public async getWorldMapGeoJson(): Promise<d3.ExtendedFeatureCollection> {
    return d3.json('/data/geo/world_map.json') as Promise<d3.ExtendedFeatureCollection>;
  }
}
