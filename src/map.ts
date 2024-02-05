import * as d3 from 'd3';

export function placeWorldMap(element: HTMLDivElement) {
  const svg = d3.create('svg').attr('viewBox', [0, 0, 975, 610]);

  const width = element.clientWidth;
  const height = element.clientHeight;

  const projection = d3
    .geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  svg
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('d', path(d3.geoGraticule()));

  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener('click', () => setCounter(counter + 1));
  setCounter(0);
}
