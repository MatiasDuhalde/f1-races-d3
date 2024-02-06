import * as d3 from 'd3';
import { Circuit, DataService, Race, Season } from '../data';
import { App } from './app';
import {
  CIRCUIT_MARKER_CLASS,
  CIRCUIT_MARKER_GROUP_ID,
  CONTROLS_ROW_CLASS,
  COUNTRY_CLASS,
  COUNTRY_GROUP_ID,
  WORLD_MAP_CONTAINER_ID,
  WORLD_MAP_CONTROLS_CONTAINER_ID,
  WORLD_MAP_SVG_ID,
  WORLD_MAP_TOOLTIP_ID,
} from './constants';
import './world-map.scss';

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
  private selectedYear: number | null;

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
    this.selectedYear = null;
  }

  public async render(element: HTMLDivElement): Promise<void> {
    this.containerElement = element;

    this.containerElement.appendChild(this.worldMapContainerElement);
    this.containerElement.appendChild(this.controlsContainerElement);
    this.containerElement.appendChild(this.tooltipElement);

    await this.drawCountries();
    await this.drawControls();
    await this.drawCircuitMarkers();
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

  private async getSeasons(): Promise<Season[]> {
    const dataService = DataService.getInstance();
    return dataService.getSeasons();
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

  private async drawControls(): Promise<void> {
    const seasons = await this.getSeasons();
    const [min, max] = d3.extent(seasons, (d) => d.year) as [number, number];

    this.selectedYear = max;

    const input = document.createElement('input');
    input.type = 'range';
    input.id = 'year-selector';
    input.name = 'year';
    input.min = min.toString();
    input.max = max.toString();
    input.value = this.selectedYear.toString();

    const label = document.createElement('label');
    label.htmlFor = 'year-selector';
    label.textContent = seasons[seasons.length - 1].year.toString();

    const leftArrow = document.createElement('button');
    leftArrow.textContent = '<';
    leftArrow.addEventListener('click', () => {
      if (this.selectedYear && this.selectedYear > min) {
        this.selectedYear--;
        input.value = this.selectedYear.toString();
        label.textContent = this.selectedYear.toString();
        this.drawCircuitMarkers();
      }
    });

    const rightArrow = document.createElement('button');
    rightArrow.textContent = '>';
    rightArrow.addEventListener('click', () => {
      if (this.selectedYear && this.selectedYear < max) {
        this.selectedYear++;
        input.value = this.selectedYear.toString();
        label.textContent = this.selectedYear.toString();
        this.drawCircuitMarkers();
      }
    });

    const sliderContainer = document.createElement('div');
    sliderContainer.className = CONTROLS_ROW_CLASS;

    sliderContainer.appendChild(leftArrow);
    sliderContainer.appendChild(input);
    sliderContainer.appendChild(rightArrow);

    const labelContainer = document.createElement('div');
    sliderContainer.className = CONTROLS_ROW_CLASS;

    labelContainer.appendChild(label);

    this.controlsContainerElement.appendChild(sliderContainer);
    this.controlsContainerElement.appendChild(labelContainer);

    input.addEventListener('input', (event) => {
      // Each time the user moves the input, update the label
      const year = (event.target as HTMLInputElement).value;
      label.textContent = year;
    });

    input.addEventListener('change', (event) => {
      // Once the change is complete, update the selected year and redraw the circuit markers
      const year = (event.target as HTMLInputElement).value;
      label.textContent = year;
      this.selectedYear = +year;
      this.drawCircuitMarkers();
    });
  }

  private async drawCircuitMarkers(): Promise<void> {
    let circuits = await this.getCircuits();

    if (this.selectedYear) {
      // If a year is selected, filter circuits by year, else keep all circuits
      let races = await this.getRaces();
      races = d3.filter(races, (race) => race.year === this.selectedYear);
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
        this.app.displayTrack(data, this.selectedYear!);
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
