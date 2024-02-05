import * as d3 from 'd3';
import { CIRCUITS_PATH } from '../constants';
import { Circuit } from './types/circuit';

export class DataService {
  private static instance: DataService;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async getCircuits(): Promise<Circuit[]> {
    console.log(CIRCUITS_PATH);
    const result = await d3.csv(CIRCUITS_PATH);
    console.log(result);
    return result.map((d) => {
      return {
        circuitId: +d.circuitId,
        circuitRef: d.circuitRef,
        name: d.name,
        location: d.location,
        country: d.country,
        lat: +d.lat,
        lng: +d.lng,
        alt: +d.alt,
        url: d.url,
      };
    });
  }
}
