import * as d3 from 'd3';
import { Circuit, DataService } from '../../data';
import { UIElement } from '../ui-element';
import './world-map.scss';

export class TrackMap implements UIElement {
  public static WORLD_MAP_CONTAINER_ID = 'world-map-container';
  public static WORLD_MAP_SVG_ID = 'world-map-svg';
  public static COUNTRY_GROUP_ID = 'country-group';
  public static CIRCUIT_MARKER_GROUP_ID = 'circuit-marker-group';
  public static WORLD_MAP_TOOLTIP_ID = 'world-map-tooltip';
  public static COUNTRY_CLASS = 'country';
  public static CIRCUIT_MARKER_CLASS = 'circuit-marker';

  private containerElement: HTMLDivElement | undefined = undefined;

  private circuit: Circuit;

  public constructor(circuit: Circuit) {
    this.circuit = circuit;
  }

  public async render(element: HTMLDivElement): Promise<void> {
    this.containerElement = element;

    console.log('Asd');

    d3.select(element)
      .node()
      ?.append(await this.getTrackSvg());
  }

  public destroy(): void {
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
    }
  }

  private async getTrackSvg(): Promise<HTMLElement> {
    const dataService = DataService.getInstance();
    const circuitRef = this.circuit.circuitRef;
    console.log(circuitRef);
    return dataService.getTrackSvg('yas_marina');
  }
}
