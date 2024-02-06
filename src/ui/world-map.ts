import * as d3 from 'd3';
import { Circuit, DataService, Race, Season } from '../data';
import {
  CIRCUIT_MARKERS_ID,
  CIRCUIT_MARKER_CLASS,
  COUNTRY_CLASS,
  MAP_CONTAINER_ID,
  TIMELINE_CONTAINER_ID,
  TOOLTIP_CLASS,
  WORLD_MAP_ID,
} from './constants';
import { getElementByIdOrThrow } from './utils';

export class WorldMap {
  private projection: d3.GeoProjection;
  private path: d3.GeoPath;
  private selectedYear: number | undefined = undefined;

  public constructor() {
    this.projection = d3.geoNaturalEarth1();
    this.path = d3.geoPath().projection(this.projection);
  }

  private async getWorldMapGeoJson(): Promise<d3.ExtendedFeatureCollection> {
    const dataService = DataService.getInstance();
    return dataService.getWorldMapGeoJson();
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

  public getMapContainerElement(): HTMLDivElement {
    return getElementByIdOrThrow<HTMLDivElement>(MAP_CONTAINER_ID);
  }

  public getTimelineContainerElement(): HTMLDivElement {
    return getElementByIdOrThrow<HTMLDivElement>(TIMELINE_CONTAINER_ID);
  }

  public async drawWorldMap(): Promise<void> {
    const containerElement = this.getMapContainerElement();

    const geoJson = await this.getWorldMapGeoJson();

    const svg = d3
      .create('svg')
      .attr('id', WORLD_MAP_ID)
      .style('width', '100%')
      .style('height', '100%');

    const { height, width } = containerElement.getBoundingClientRect();

    this.projection.fitSize([width, height], geoJson);

    const g = svg.append('g');

    g.selectAll('path')
      .data(geoJson.features)
      .join('path')
      .attr('class', COUNTRY_CLASS)
      .attr('d', this.path);

    const node = svg.node() as Node;

    containerElement.appendChild(node);
  }

  public async drawCircuitMarkers(): Promise<void> {
    const svg = d3.select('#' + WORLD_MAP_ID);

    const g = svg.select('#' + CIRCUIT_MARKERS_ID);

    if (g.empty()) {
      svg.append('g').attr('id', CIRCUIT_MARKERS_ID);
    }

    let circuits = await this.getCircuits();

    if (this.selectedYear) {
      let races = await this.getRaces();
      races = d3.filter(races, (race) => race.year === this.selectedYear);
      circuits = circuits.filter((circuit) =>
        races.some((race) => race.circuitId === circuit.circuitId),
      );
    }

    // FIXME: Circuit markers are not being displayed on first render

    g.selectAll('.' + CIRCUIT_MARKER_CLASS)
      .data(circuits)
      .join('circle')
      .attr('class', CIRCUIT_MARKER_CLASS)
      .attr('cx', (d) => {
        return this.projection([d.lng, d.lat])![0];
      })
      .attr('cy', (d) => {
        return this.projection([d.lng, d.lat])![1];
      })
      .attr('r', 4);

    svg.selectAll('.' + COUNTRY_CLASS).attr('class', (feature: any) => {
      // FIXME: This is a hack to get the country name from the GeoJSON properties
      // It does not work for all countries
      // A better solution would be to standardize the country names to ISO code using some library
      const shortCountryName = feature.properties.brk_name;
      const countryName = feature.properties.name;
      console.log(feature.properties);
      if (
        circuits.some(
          (circuit) => circuit.country === countryName || circuit.country === shortCountryName,
        )
      )
        return `${COUNTRY_CLASS} active`;
      return COUNTRY_CLASS;
    });

    // select or create tooltip
    let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, unknown> = d3.select(
      '.' + TOOLTIP_CLASS,
    );
    if (tooltip.empty()) {
      tooltip = d3
        .select('#' + MAP_CONTAINER_ID)
        .append('div')
        .attr('class', TOOLTIP_CLASS);
    }

    g.selectAll('.' + CIRCUIT_MARKER_CLASS)
      .on('mouseenter', (_, data: unknown) => {
        tooltip.text((data as Circuit).name);
        return tooltip.style('visibility', 'visible');
      })
      .on('mousemove', (event) => {
        return tooltip.style('top', `${event.pageY + 20}px`).style('left', `${event.pageX + 20}px`);
      })
      .on('mouseleave', () => {
        return tooltip.style('visibility', 'hidden');
      });
  }

  public async drawYearSelector(): Promise<void> {
    const seasons = await this.getSeasons();

    const [min, max] = d3.extent(seasons, (d) => d.year) as [number, number];

    this.selectedYear = max;

    const containerElement = this.getTimelineContainerElement();

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

    containerElement.appendChild(input);
    containerElement.appendChild(label);

    input.addEventListener('input', (event) => {
      const year = (event.target as HTMLInputElement).value;
      label.textContent = year;
    });

    input.addEventListener('change', (event) => {
      const year = (event.target as HTMLInputElement).value;
      label.textContent = year;
      this.selectedYear = +year;
      this.drawCircuitMarkers();
    });
  }
}
