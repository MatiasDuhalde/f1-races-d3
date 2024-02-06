import * as d3 from 'd3';
import { Circuit, DataService, Race } from '../../data';
import { App } from '../app';
import {
  CIRCUIT_MARKER_CLASS,
  CIRCUIT_MARKER_GROUP_ID,
  COUNTRY_CLASS,
  COUNTRY_GROUP_ID,
  WORLD_MAP_CONTAINER_ID,
  WORLD_MAP_CONTROLS_CONTAINER_ID,
  WORLD_MAP_SVG_ID,
  WORLD_MAP_TOOLTIP_ID,
} from '../constants';
import './world-map.scss';
import { YearSlider } from './year-slider';

export class WorldMap {
  private app: App;

  private projection: d3.GeoProjection;
  private path: d3.GeoPath;

  private containerElement: HTMLDivElement | undefined = undefined;
  private worldMapContainerElement: HTMLDivElement;
  private controlsContainerElement: HTMLDivElement;
  private tooltipElement: HTMLDivElement;

  private mapSvg: SVGSVGElement;
  private circuitMarkerGroup: SVGGElement;
  private countryGroup: SVGGElement;

  private mapResizeObserver: ResizeObserver;

  private geoJson: d3.ExtendedFeatureCollection;

  private circuits: Circuit[] = [];

  public constructor(app: App) {
    this.app = app;

    this.projection = d3.geoNaturalEarth1();
    this.path = d3.geoPath().projection(this.projection);

    this.worldMapContainerElement = document.createElement('div');
    this.worldMapContainerElement.id = WORLD_MAP_CONTAINER_ID;
    this.controlsContainerElement = document.createElement('div');
    this.controlsContainerElement.id = WORLD_MAP_CONTROLS_CONTAINER_ID;
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.id = WORLD_MAP_TOOLTIP_ID;

    const svg = d3.create('svg').attr('id', WORLD_MAP_SVG_ID);

    const countryGroup = svg.append('g').attr('id', COUNTRY_GROUP_ID);
    const circuitMarkerGroup = svg.append('g').attr('id', CIRCUIT_MARKER_GROUP_ID);

    this.mapSvg = svg.node() as SVGSVGElement;
    this.countryGroup = countryGroup.node() as SVGGElement;
    this.circuitMarkerGroup = circuitMarkerGroup.node() as SVGGElement;

    this.worldMapContainerElement.appendChild(this.mapSvg);

    this.mapResizeObserver = new ResizeObserver(() => {
      // Call function resizeMap when the map container is resized
      this.resizeMap();
    });
    this.mapResizeObserver.observe(this.worldMapContainerElement);

    this.geoJson = { type: 'FeatureCollection', features: [] };

    this.circuits = [];
  }

  public async render(element: HTMLDivElement): Promise<void> {
    this.containerElement = element;

    this.containerElement.appendChild(this.worldMapContainerElement);
    this.containerElement.appendChild(this.controlsContainerElement);
    this.containerElement.appendChild(this.tooltipElement);

    const yearSlider = new YearSlider(this.app);

    await this.drawCountries();
    yearSlider.render(this.controlsContainerElement);
    await this.drawCircuitMarkers();

    this.app.yearSubject.subscribe(async () => {
      await this.drawCircuitMarkers();
    });
  }

  private async getWorldMapGeoJson(): Promise<d3.ExtendedFeatureCollection> {
    const dataService = DataService.getInstance();
    this.geoJson = await dataService.getWorldMapGeoJson();
    return this.geoJson;
  }

  private async getCircuits(): Promise<Circuit[]> {
    const dataService = DataService.getInstance();
    return dataService.getCircuits();
  }

  private async getRaces(): Promise<Race[]> {
    const dataService = DataService.getInstance();
    return dataService.getRaces();
  }

  private async resizeMap(): Promise<void> {
    const { height, width } = this.worldMapContainerElement.getBoundingClientRect();
    const geoJson = await this.getWorldMapGeoJson();

    this.projection.fitSize([width, height], geoJson);
    const svg = d3.select(this.mapSvg);

    svg
      .attr('width', width)
      .attr('height', height)
      .selectAll('.' + COUNTRY_CLASS)
      .attr('d', this.path as any);

    this.placeCircuitMarkers();
  }

  private async drawCountries(): Promise<void> {
    const geoJson = await this.getWorldMapGeoJson();

    const countryGroup = d3.select(this.countryGroup);

    countryGroup
      .selectAll('path')
      .data(geoJson.features)
      .join('path')
      .attr('class', COUNTRY_CLASS)
      .attr('d', this.path);
  }

  private async drawCircuitMarkers(): Promise<void> {
    let circuits = await this.getCircuits();

    const year = this.app.getYear();

    if (year) {
      // If a year is selected, filter circuits by year, else keep all circuits
      let races = await this.getRaces();
      races = d3.filter(races, (race) => race.year === year);
      circuits = circuits.filter((circuit) =>
        races.some((race) => race.circuitId === circuit.circuitId),
      );
    }

    this.circuits = circuits;

    this.placeCircuitMarkers();
    this.colorCountries();
  }

  private placeCircuitMarkers(): void {
    const circuitMarkerGroup = d3.select(this.circuitMarkerGroup);

    circuitMarkerGroup
      .selectAll('.' + CIRCUIT_MARKER_CLASS)
      .data(this.circuits)
      .join('circle')
      .attr('class', CIRCUIT_MARKER_CLASS)
      .attr('cx', (d) => {
        return this.projection([d.lng, d.lat])![0];
      })
      .attr('cy', (d) => {
        return this.projection([d.lng, d.lat])![1];
      })
      .attr('r', 4)
      .on('mouseenter', (_, data) => {
        this.tooltipElement.textContent = data.name;
        this.tooltipElement.style.visibility = 'visible';
      })
      .on('mousemove', (event) => {
        this.tooltipElement.style.top = `${event.pageY + 20}px`;
        this.tooltipElement.style.left = `${event.pageX + 20}px`;
      })
      .on('mouseleave', () => {
        this.tooltipElement.style.visibility = 'hidden';
      })
      .on('click', (_, data) => {
        this.app.displayTrack(data);
      });
  }

  private colorCountries(): void {
    const svg = d3.select(this.mapSvg);

    svg.selectAll('.' + COUNTRY_CLASS).attr('class', (feature: any) => {
      const countryCode = feature.properties.iso_a2_eh;
      if (this.circuits.some((circuit) => circuit.country === countryCode))
        return `${COUNTRY_CLASS} active`;
      return COUNTRY_CLASS;
    });
  }
}
