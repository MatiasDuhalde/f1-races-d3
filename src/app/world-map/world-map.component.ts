import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { DataService } from '../data/data.service';
import { Circuit } from '../data/types';
import { YearService } from '../year.service';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [],
  templateUrl: './world-map.component.html',
  styleUrl: 'world-map.component.scss',
})
export class WorldMapComponent implements OnInit, OnDestroy, AfterViewInit {
  private static WORLD_MAP_SVG_ID = 'world-map-svg';
  private static COUNTRY_GROUP_ID = 'country-group';
  private static CIRCUIT_MARKER_GROUP_ID = 'circuit-marker-group';
  public static COUNTRY_CLASS = 'country';
  public static CIRCUIT_MARKER_CLASS = 'circuit-marker';

  private mapResizeObserver: ResizeObserver;
  private yearSubscription: Subscription;

  private mapSvg: d3.Selection<SVGSVGElement, undefined, null, undefined>;
  private countryGroup: d3.Selection<SVGGElement, undefined, null, undefined>;
  private circuitMarkerGroup: d3.Selection<SVGGElement, undefined, null, undefined>;

  private projection: d3.GeoProjection = d3.geoNaturalEarth1();
  private path: d3.GeoPath = d3.geoPath().projection(this.projection);

  private circuits: Map<number, Circuit> = new Map();
  private geoJson: d3.ExtendedFeatureCollection = { type: 'FeatureCollection', features: [] };

  @ViewChild('worldMapContainer') worldMapContainerElement: ElementRef<HTMLDivElement>;
  @ViewChild('worldMapTooltip') tooltipElement: ElementRef<HTMLDivElement>;

  constructor(
    private dataService: DataService,
    private yearService: YearService,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.render();
  }

  ngAfterViewInit(): void {
    this.worldMapContainerElement.nativeElement.appendChild(this.mapSvg.node()!);

    this.mapResizeObserver = new ResizeObserver(() => {
      this.resizeMap();
    });
    this.mapResizeObserver.observe(this.worldMapContainerElement.nativeElement);
  }

  private async render(): Promise<void> {
    this.createSvg();
    await this.drawCountries();
    await this.drawCircuitMarkers();

    this.yearSubscription = this.yearService.year$.subscribe(async (year) => {
      this.circuits = await this.dataService.getCircuitsByYear(year);
      this.placeCircuitMarkers();
      this.colorCountries();
    });
  }

  private createSvg(): void {
    this.mapSvg = d3.create('svg').attr('id', WorldMapComponent.WORLD_MAP_SVG_ID);

    this.countryGroup = this.mapSvg.append('g').attr('id', WorldMapComponent.COUNTRY_GROUP_ID);
    this.circuitMarkerGroup = this.mapSvg
      .append('g')
      .attr('id', WorldMapComponent.CIRCUIT_MARKER_GROUP_ID);
  }

  private async drawCountries(): Promise<void> {
    this.geoJson = await this.dataService.getWorldMapGeoJson();

    this.countryGroup
      .selectAll('path')
      .data(this.geoJson.features)
      .join('path')
      .attr('class', WorldMapComponent.COUNTRY_CLASS)
      .attr('d', this.path);
  }

  private async drawCircuitMarkers(): Promise<void> {
    this.circuits = await this.dataService.getCircuitsByYear(2021);

    this.placeCircuitMarkers();
    this.colorCountries();
  }

  public ngOnDestroy(): void {
    this.mapResizeObserver.disconnect();
    this.yearSubscription.unsubscribe();
  }

  private async resizeMap(): Promise<void> {
    const { height, width } = this.worldMapContainerElement.nativeElement.getBoundingClientRect();
    this.geoJson = await this.dataService.getWorldMapGeoJson();

    this.projection.fitSize([width, height], this.geoJson);

    this.mapSvg
      .attr('width', width)
      .attr('height', height)
      .selectAll('.' + WorldMapComponent.COUNTRY_CLASS)
      .attr('d', this.path as any);

    this.placeCircuitMarkers();
  }

  private placeCircuitMarkers(): void {
    this.circuitMarkerGroup
      .selectAll('.' + WorldMapComponent.CIRCUIT_MARKER_CLASS)
      .data(this.circuits.values())
      .join('circle')
      .attr('class', WorldMapComponent.CIRCUIT_MARKER_CLASS)
      .attr('cx', (d) => {
        return this.projection([d.lng, d.lat])![0];
      })
      .attr('cy', (d) => {
        return this.projection([d.lng, d.lat])![1];
      })
      .attr('r', 4)
      .on('mouseenter', (_, data) => {
        this.tooltipElement.nativeElement.textContent = data.name;
        this.tooltipElement.nativeElement.style.visibility = 'visible';
      })
      .on('mousemove', (event) => {
        this.tooltipElement.nativeElement.style.top = `${event.pageY + 20}px`;
        this.tooltipElement.nativeElement.style.left = `${event.pageX + 20}px`;
      })
      .on('mouseleave', () => {
        this.tooltipElement.nativeElement.style.visibility = 'hidden';
      })
      .on('click', (_, data) => {
        this.ngZone.run(() => this.router.navigate(['circuit', data.circuitId]));
      });
  }

  private colorCountries(): void {
    this.mapSvg.selectAll('.' + WorldMapComponent.COUNTRY_CLASS).attr('class', (feature: any) => {
      const countryCode = feature.properties.iso_a2_eh;
      if (Array.from(this.circuits.values()).some((circuit) => circuit.country === countryCode))
        return `${WorldMapComponent.COUNTRY_CLASS} active`;
      return WorldMapComponent.COUNTRY_CLASS;
    });
  }
}
