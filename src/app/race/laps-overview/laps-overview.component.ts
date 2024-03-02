import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { LapTime, PitStop, Race } from '../../data/types';
import { DriverLapData, DriverResult, RaceDataService } from '../race-data.service';

@Component({
  selector: 'app-laps-overview',
  standalone: true,
  imports: [],
  templateUrl: './laps-overview.component.html',
  styleUrl: './laps-overview.component.scss',
})
export class LapsOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  private static LAPS_OVERVIEW_SVG_ID = 'laps-overview-svg';
  private static TIME_SEGMENTS_GROUP_ID = 'time-segments-group';
  private static DRIVER_NAMES_GROUP_ID = 'driver-names-group';
  @Input() race: Race;
  @ViewChild('lapsOverviewContainer') lapsOverviewContainerElement: ElementRef<HTMLDivElement>;
  @ViewChild('lapsOverviewTooltip') lapsOverviewTooltipElement: ElementRef<HTMLDivElement>;

  private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
  private timeSegmentsGroup: d3.Selection<SVGGElement, undefined, null, undefined>;
  private driverNameGroup: d3.Selection<SVGGElement, undefined, null, undefined>;

  private data: DriverResult[] = [];

  private svgResizeObserver: ResizeObserver = new ResizeObserver(() => this.update());
  private raceDataSubscription: Subscription;

  constructor(private raceDataService: RaceDataService) {}

  ngOnInit(): void {
    this.render();
  }

  ngAfterViewInit(): void {
    this.lapsOverviewContainerElement.nativeElement.appendChild(this.svg.node()!);
    this.raceDataSubscription = this.raceDataService.raceData$.subscribe((data) => {
      this.data = data;
      this.update();
    });
    this.svgResizeObserver.observe(this.lapsOverviewContainerElement.nativeElement);
  }

  ngOnDestroy(): void {
    this.svgResizeObserver.disconnect();
    this.raceDataSubscription.unsubscribe();
  }

  private async render() {
    this.createSvg();
  }

  private async update() {
    this.draw();
  }

  private createSvg() {
    this.svg = d3
      .create('svg')
      .attr('id', LapsOverviewComponent.LAPS_OVERVIEW_SVG_ID)
      .attr('width', '100%')
      .attr('height', '100%');

    this.driverNameGroup = this.svg
      .append('g')
      .attr('id', LapsOverviewComponent.DRIVER_NAMES_GROUP_ID);
    this.timeSegmentsGroup = this.svg
      .append('g')
      .attr('id', LapsOverviewComponent.TIME_SEGMENTS_GROUP_ID);
  }

  private draw(): void {
    const { height, width } =
      this.lapsOverviewContainerElement.nativeElement.getBoundingClientRect();

    const margin = { top: 20, right: 100, bottom: 20, left: 160 };

    const minTime = 0;
    const maxTime = d3.max(this.data, (d) => d.duration)!;

    const x = d3
      .scaleLinear()
      .domain([minTime, maxTime])
      .range([0, width - margin.right - margin.left]);

    const refs = this.data.map((entry) => entry.driverRef);

    const y = d3
      .scaleBand()
      .domain(refs)
      .range([margin.top, height - margin.bottom]);

    this.driverNameGroup.selectAll('.driver-name').remove();

    this.driverNameGroup
      .selectAll('.driver-name')
      .data(this.data, (entry: any) => entry.driverRef)
      .enter()
      .append('text')
      .attr('class', 'driver-name')
      .text((d) => d.surname)
      .attr('text-anchor', 'end')
      .attr('fill', 'white')
      .attr('alignment-baseline', 'middle')
      .attr('x', margin.left - 10)
      .attr('y', (d) => (y(d.driverRef) as number) + y.bandwidth() / 2);

    this.timeSegmentsGroup.selectAll('.driver-timeline').remove();

    this.timeSegmentsGroup
      .selectAll('.driver-timeline')
      .data(this.data, (entry: any) => entry.driverRef)
      .enter()
      .append('g')
      .attr('class', 'driver-timeline')
      .attr('transform', (d) => `translate(0, ${y(d.driverRef)})`)
      .on('click', (event, d) => {
        // TODO spawn wikipedia (d.url)
      })
      .selectAll('.segment')
      .data((r) => r.data)
      .enter()
      .append('rect')
      .attr('class', 'segment')
      .attr('height', y.bandwidth() - 2)
      .attr('width', (entry) => x(entry.milliseconds))
      .attr('x', (entry) => x(entry.start) + margin.left)
      .attr('fill', (entry) => this.color(entry))
      .on('mouseenter', (event, entry) => {
        this.svg.selectAll('.tooltip').remove();
        const tooltip = this.svg.append('g').attr('class', 'tooltip');
        tooltip
          .append('rect')
          .attr('x', width - margin.right)
          .attr('y', event.layerY)
          .attr('stroke', 'black')
          .attr('width', margin.right)
          .attr('height', 40)
          .attr('fill', '#00000000');
        tooltip
          .append('text')
          .text(
            this.raceDataService.isLapTime(entry)
              ? 'Lap ' + (entry as LapTime).lap
              : 'Pit ' + (entry as PitStop).stop,
          )
          .attr('color', 'black')
          .attr('x', width - margin.right)
          .attr('y', event.layerY + 15);
        tooltip
          .append('text')
          .text(
            this.raceDataService.isLapTime(entry)
              ? 'Pos ' + (entry as LapTime).position
              : 'Dur ' + (entry as PitStop).duration,
          )
          .attr('x', width - margin.right)
          .attr('y', event.layerY + 30);
      });
  }

  private color(entry: DriverLapData): string {
    if (this.raceDataService.isPitStop(entry)) return '#000000';
    return entry.lap % 2 ? '#edf8e9' : '#bae4b3';
  }
}
