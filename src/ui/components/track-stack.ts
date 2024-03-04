import * as d3 from 'd3';
import { Circuit, DataService, Race } from '../../data';
import { App } from '../app';
import { UIElement } from '../ui-element';
import './track-stack.scss';

export class TrackStack implements UIElement {
  public static TRACK_STACK_NAMES_ID = 'track-stack-names';
  public static TRACK_STACK_SVG_ID = 'stack-trace-svg'

  private app: App;

  private containerElement: HTMLDivElement | undefined = undefined;

  private names: HTMLDivElement;
  private trackSvg: SVGSVGElement;

  private resizeObserver: ResizeObserver;

  private dataService: DataService;
  
  private race: Race | undefined;
  private circuit: Circuit;

  public constructor(app: App, circuit: Circuit) {
    this.app = app;
    this.circuit = circuit;

    this.dataService = DataService.getInstance();

    const svg = d3.create('svg').attr('id', TrackStack.TRACK_STACK_SVG_ID);
    this.trackSvg = svg.node() as SVGSVGElement;

    this.names = document.createElement('div');
    this.names.id = TrackStack.TRACK_STACK_NAMES_ID;

    this.resizeObserver = new ResizeObserver(() => {
      // Call function resizeMap when the map container is resized
      this.resizeView();
    });
    this.resizeObserver.observe(this.trackSvg);
  }

  private async resizeView(): Promise<void> {
    const width = this.trackSvg.clientWidth;
    const height = this.trackSvg.clientHeight;

    this.trackSvg.setAttribute('width', `${width}`);
    this.trackSvg.setAttribute('height', `${height}`);

    this.names.style.height = `${height}px`;

    this.drawNames();
  }

  private async getRaceByYearAndCircuitId(): Promise<Race | undefined> {
    const dataService = DataService.getInstance();

    dataService.getResults();

    const year = this.app.getYear();
    return year !== null
      ? dataService.getRaceByYearAndCircuitId(year, this.circuit.circuitId)
      : undefined;
  }

  public async render(element: HTMLDivElement): Promise<void> {
    this.containerElement = element;

    this.containerElement.appendChild(this.names);
    this.containerElement.appendChild(this.trackSvg);

    

    this.app.yearSubject.subscribe(async () => {
      this.race = await this.getRaceByYearAndCircuitId();
    });
  }

  public destroy(): void {
    this.resizeObserver.disconnect();

    this.containerElement?.removeChild(this.names);
    this.containerElement?.removeChild(this.trackSvg);
  }

  private async drawNames(): Promise<void> {
    this.names.innerHTML = '';
    const names = document.createElement('div');
    names.classList.add('names');

    this.dataService.
  }
}
