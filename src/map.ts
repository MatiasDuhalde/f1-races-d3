import * as d3 from 'd3';
import { DataService } from './data/data';

export const placeWorldMap = async (element: HTMLDivElement): Promise<void> => {
  const width = element.clientWidth;
  const height = element.clientHeight;

  const dataService = DataService.getInstance();
  const geoJson = await dataService.getWorldMapGeoJson();

  const svg = d3
    .create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('id', 'world-map')
    .style('width', '100%')
    .style('height', 'auto');

  const projection = d3
    .geoNaturalEarth1()
    .fitSize([width, height], geoJson)
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  const g = svg.append('g');

  console.log(geoJson);

  g.selectAll('path').data(geoJson.features).join('path').attr('class', 'country').attr('d', path);

  const node = svg.node() as Node;

  element.appendChild(node);
};

export const placeCircuits = async (): Promise<void> => {
  const dataService = DataService.getInstance();
  const circuits = await dataService.getCircuits();

  const svg = d3.select('#world-map');

  const g = svg.append('g');

  g.selectAll('circle')
    .data(circuits)
    .join('circle')
    .attr('cx', (d) => d.lng)
    .attr('cy', (d) => d.lat)
    .attr('r', 5)
    .attr('fill', 'red');
};
