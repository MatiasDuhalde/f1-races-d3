import * as d3 from 'd3';
import { Circuit, DataService } from '../../data';
import { App } from '../app';
import { UIElement } from '../ui-element';
import './world-map.scss';

export class WorldMap implements UIElement {
  public static WORLD_MAP_CONTAINER_ID = 'world-map-container';
  public static WORLD_MAP_SVG_ID = 'world-map-svg';
  public static COUNTRY_GROUP_ID = 'country-group';
  public static CIRCUIT_MARKER_GROUP_ID = 'circuit-marker-group';
  public static WORLD_MAP_TOOLTIP_ID = 'world-map-tooltip';
  public static COUNTRY_CLASS = 'country';
  public static CIRCUIT_MARKER_CLASS = 'circuit-marker';

  private app: App;

  private projection: d3.GeoProjection;
  private path: d3.GeoPath;

  private containerElement: HTMLDivElement | undefined = undefined;
  private worldMapContainerElement: HTMLDivElement;
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
    this.worldMapContainerElement.id = WorldMap.WORLD_MAP_CONTAINER_ID;
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.id = WorldMap.WORLD_MAP_TOOLTIP_ID;

    const svg = d3.create('svg').attr('id', WorldMap.WORLD_MAP_SVG_ID);

    const countryGroup = svg.append('g').attr('id', WorldMap.COUNTRY_GROUP_ID);
    const circuitMarkerGroup = svg.append('g').attr('id', WorldMap.CIRCUIT_MARKER_GROUP_ID);

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
    this.containerElement.appendChild(this.tooltipElement);

    await this.drawCountries();
    await this.drawCircuitMarkers();

    this.app.yearSubject.subscribe(async () => {
      await this.drawCircuitMarkers();
    });
  }

  public destroy(): void {
    this.mapResizeObserver.disconnect();
    this.containerElement?.removeChild(this.worldMapContainerElement);
    this.containerElement?.removeChild(this.tooltipElement);
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

  private async getCircuitsByYear(year: number): Promise<Circuit[]> {
    const dataService = DataService.getInstance();
    return dataService.getCircuitsByYear(year);
  }

  private async resizeMap(): Promise<void> {
    const { height, width } = this.worldMapContainerElement.getBoundingClientRect();
    const geoJson = await this.getWorldMapGeoJson();

    this.projection.fitSize([width, height], geoJson);
    const svg = d3.select(this.mapSvg);

    svg
      .attr('width', width)
      .attr('height', height)
      .selectAll('.' + WorldMap.COUNTRY_CLASS)
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
      .attr('class', WorldMap.COUNTRY_CLASS)
      .attr('d', this.path);
  }

  private async drawCircuitMarkers(): Promise<void> {
    const year = this.app.getYear();

    this.circuits = year ? await this.getCircuitsByYear(year) : await this.getCircuits();

    this.placeCircuitMarkers();
    this.colorCountries();
  }

  private placeCircuitMarkers(): void {
    const circuitMarkerGroup = d3.select(this.circuitMarkerGroup);

    circuitMarkerGroup
      .selectAll('.' + WorldMap.CIRCUIT_MARKER_CLASS)
      .data(this.circuits)
      .join('circle')
      .attr('class', WorldMap.CIRCUIT_MARKER_CLASS)
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

    svg.selectAll('.' + WorldMap.COUNTRY_CLASS).attr('class', (feature: any) => {
      const countryCode = feature.properties.iso_a2_eh;
      if (this.circuits.some((circuit) => circuit.country === countryCode))
        return `${WorldMap.COUNTRY_CLASS} active`;
      return WorldMap.COUNTRY_CLASS;
    });
  }
}
