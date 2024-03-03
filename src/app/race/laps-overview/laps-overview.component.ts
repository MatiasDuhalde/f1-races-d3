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
import { Race } from '../../data/types';
import { DriverResult, RaceDataService, Segment } from '../race-data.service';

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
  private static POSITIONS_GROUP_ID = 'positions-group';
  @Input() race: Race;
  @ViewChild('lapsOverviewContainer') lapsOverviewContainerElement: ElementRef<HTMLDivElement>;
  @ViewChild('lapsOverviewTooltip') lapsOverviewTooltipElement: ElementRef<HTMLDivElement>;

  private svg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
  private timeSegmentsGroup: d3.Selection<SVGGElement, undefined, null, undefined>;
  private driverNamesGroup: d3.Selection<SVGGElement, undefined, null, undefined>;
  private positionsGroup: d3.Selection<SVGGElement, undefined, null, undefined>;

  private data: DriverResult[] = [];

  private svgResizeObserver: ResizeObserver = new ResizeObserver(() => this.update());
  private raceDataSubscription: Subscription;

  private margin = { top: 20, right: 20, bottom: 20, left: 160 };
  private flagOffset = 40;
  private positionOffset = 120;
  private textSpace = 10;
  private lineGap = 2;

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

    const squareSize = this.flagOffset / 4;

    const pattern = this.svg
      .append('defs')
      .append('pattern')
      .attr('id', 'checkered')
      .attr('width', squareSize * 2)
      .attr('height', squareSize * 2)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern
      .append('rect')
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', 'white');

    pattern
      .append('rect')
      .attr('x', squareSize)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', 'black');

    pattern
      .append('rect')
      .attr('y', squareSize)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', 'black');

    pattern
      .append('rect')
      .attr('x', squareSize)
      .attr('y', squareSize)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', 'white');

    this.driverNamesGroup = this.svg
      .append('g')
      .attr('id', LapsOverviewComponent.DRIVER_NAMES_GROUP_ID);
    this.timeSegmentsGroup = this.svg
      .append('g')
      .attr('id', LapsOverviewComponent.TIME_SEGMENTS_GROUP_ID);
    this.positionsGroup = this.svg.append('g').attr('id', LapsOverviewComponent.POSITIONS_GROUP_ID);
  }

  private draw(): void {
    const { height, width } =
      this.lapsOverviewContainerElement.nativeElement.getBoundingClientRect();

    const minTime = 0;
    const maxTime = d3.max(this.data, (d) => d.totalSegmentDuration)!;

    const segmentsWidth =
      width - this.margin.left - this.margin.right - this.flagOffset - this.positionOffset;

    const x = d3.scaleLinear().domain([minTime, maxTime]).range([0, segmentsWidth]);

    const refs = this.data.map((entry) => entry.driverRef);

    const y = d3
      .scaleBand()
      .domain(refs)
      .range([this.margin.top, height - this.margin.bottom]);

    const segmentHeight = y.bandwidth() - this.lineGap;

    this.driverNamesGroup.selectAll('.driver-name').remove();

    this.driverNamesGroup
      .selectAll('.driver-name')
      .data(this.data, (entry: any) => entry.driverRef)
      .enter()
      .append('text')
      .attr('class', 'driver-name')
      .text((d) => d.surname)
      .attr('text-anchor', 'end')
      .attr('fill', 'white')
      .attr('dominant-baseline', 'middle')
      .attr('x', this.margin.left - this.textSpace)
      .attr('y', (d) => y(d.driverRef)! + segmentHeight / 2);

    this.timeSegmentsGroup.selectAll('.driver-timeline').remove();

    const timeline = this.timeSegmentsGroup
      .selectAll('.driver-timeline')
      .data(this.data, (entry: any) => entry.driverRef)
      .enter()
      .append('g')
      .attr('class', 'driver-timeline')
      .attr('transform', (d) => `translate(0, ${y(d.driverRef)})`)
      .on('click', (event, d) => {
        this.raceDataService.setSelectedDriver(d);
      });

    timeline
      .selectAll('.segment')
      .data((r) => r.segments)
      .enter()
      .append('rect')
      .attr('class', 'segment')
      .attr('height', segmentHeight)
      .attr('width', (entry) => x(entry.milliseconds))
      .attr('x', (entry) => x(entry.start) + this.margin.left)
      .attr('fill', (entry) => this.color(entry))
      .on('mouseenter', (_, data) => {
        const isLapTime = this.raceDataService.isLapTime(data);
        let text = isLapTime ? `Lap ${data.number}` : `Pit Stop ${data.number}`;

        if (isLapTime) {
          text += `\n - Position ${data.position}`;
          text += `\n - Time ${data.durString}`;
        }
        if (!isLapTime) {
          text += `\n - Duration ${data.durString}`;
        }
        this.lapsOverviewTooltipElement.nativeElement.textContent = text;
        this.lapsOverviewTooltipElement.nativeElement.style.visibility = 'visible';
      })
      .on('mousemove', (event) => {
        this.lapsOverviewTooltipElement.nativeElement.style.top = `${event.pageY + 20}px`;
        this.lapsOverviewTooltipElement.nativeElement.style.left = `${event.pageX + 20}px`;
      })
      .on('mouseleave', () => {
        this.lapsOverviewTooltipElement.nativeElement.style.visibility = 'hidden';
      });

    timeline
      .append('rect')
      .attr('x', (d) => x(d.totalSegmentDuration) + this.margin.left)
      .attr('y', 0)
      .attr(
        'width',
        (d) =>
          width -
          this.margin.left -
          this.margin.right -
          this.positionOffset -
          x(d.totalSegmentDuration),
      )
      .attr('height', segmentHeight)
      .attr('fill', (d) => {
        const { result } = d;
        if (!result) return '';
        return result.position ? 'url(#checkered)' : 'red';
      });

    this.positionsGroup.selectAll('.position-label').remove();

    this.positionsGroup
      .selectAll('.position-label')
      .data(this.data, (entry: any) => entry.driverRef)
      .enter()
      .append('text')
      .attr('class', 'position-label')
      .text((d) => {
        const { result } = d;
        if (!result) return '';
        let text = result.positionText;
        if (result.time) {
          text += ` ${result.time}`;
        } else {
          text += ` ${d.status}`;
        }
        return text;
      })
      .attr('text-anchor', 'start')
      .attr('fill', 'white')
      .attr('dominant-baseline', 'middle')
      .attr('x', x(maxTime) + this.margin.left + this.flagOffset + this.textSpace)
      .attr('y', (d) => y(d.driverRef)! + segmentHeight / 2);
  }

  private color(entry: Segment): string {
    if (this.raceDataService.isPitStop(entry)) return '#000000';
    return entry.lap % 2 ? '#edf8e9' : '#bae4b3';
  }
}
