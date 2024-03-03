import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../data/data.service';
import { Circuit } from '../../data/types';
import { RaceDataService } from '../race-data.service';

@Component({
  selector: 'app-track-info',
  standalone: true,
  imports: [],
  templateUrl: './track-info.component.html',
  styleUrl: './track-info.component.scss',
})
export class TrackInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trackSvgContainer') trackInfoContainerElement: ElementRef<HTMLDivElement>;

  private circuitSubscription: Subscription;

  constructor(private dataService: DataService, private raceDataService: RaceDataService) {}

  ngAfterViewInit(): void {
    this.circuitSubscription = this.raceDataService.circuit$.subscribe((circuit) => {
      if (circuit) {
        this.loadTrackSvg(circuit);
      }
    });
  }

  ngOnDestroy(): void {
    this.circuitSubscription.unsubscribe();
  }

  private async loadTrackSvg(circuit: Circuit): Promise<void> {
    const svgElement = await this.dataService.getCircuitSvg(circuit.circuitRef);
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '100%');
    this.trackInfoContainerElement.nativeElement.innerHTML = svgElement.outerHTML;
  }
}
