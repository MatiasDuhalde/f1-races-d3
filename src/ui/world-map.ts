import * as d3 from 'd3';
import { Circuit, DataService } from '../data';
import {
  CIRCUIT_MARKER_CLASS,
  COUNTRY_CLASS,
  MAP_CONTAINER_ID,
  TOOLTIP_CLASS,
  WORLD_MAP_ID,
} from './constants';
import { getElementByIdOrThrow } from './utils';

export class WorldMap {
  private projection: d3.GeoProjection;
  private path: d3.GeoPath;

  public constructor() {
    this.projection = d3.geoNaturalEarth1();
    this.path = d3.geoPath().projection(this.projection);
  }

  private async getWorldMapGeoJson(): Promise<d3.ExtendedFeatureCollection> {
    const dataService = DataService.getInstance();
    return dataService.getWorldMapGeoJson();
  }

  public getElement(): HTMLDivElement {
    return getElementByIdOrThrow<HTMLDivElement>(MAP_CONTAINER_ID);
  }

  public async drawWorldMap(): Promise<void> {
    const containerElement = this.getElement();

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

  public async drawCircuits(): Promise<void> {
    const dataService = DataService.getInstance();
    const circuits = await dataService.getCircuits();

    const svg = d3.select('#world-map');

    const g = svg.append('g');

    g.selectAll('circle')
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

    svg.selectAll('.country').attr('class', (feature: any) => {
      const countryName = feature.properties.brk_name;
      console.log(feature.properties);
      if (circuits.some((circuit) => circuit.country === countryName))
        return `${COUNTRY_CLASS} active`;
      return 'country';
    });

    const tooltip = d3
      .select('#' + MAP_CONTAINER_ID)
      .append('div')
      .attr('class', TOOLTIP_CLASS);

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
}
