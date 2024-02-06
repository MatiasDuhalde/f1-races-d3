import { Circuit } from '../../data';
import { App } from '../app';
import { YearSlider } from '../components/year-slider';
import { View } from './view';

export class Track extends View {
  private circuit: Circuit;

  public constructor(app: App, circuit: Circuit) {
    super(app);
    this.circuit = circuit;
  }

  public async render(element: HTMLDivElement): Promise<void> {
    const trackContainer = document.createElement('div');
    trackContainer.id = 'track-container';

    const trackTitle = document.createElement('h1');
    trackTitle.innerText = `${this.circuit.name}`;

    const trackMapContainer = document.createElement('div');
    trackMapContainer.id = 'track-map-container';

    const controlsContainerElement = document.createElement('div');
    // controlsContainerElement.id = WORLD_MAP_CONTROLS_CONTAINER_ID;

    trackContainer.appendChild(trackTitle);
    trackContainer.appendChild(trackMapContainer);
    trackContainer.appendChild(controlsContainerElement);
    element.appendChild(trackContainer);

    const yearSlider = new YearSlider(this.app);
    await yearSlider.render(controlsContainerElement);
  }

  public destroy(): void {
    const trackContainer = document.getElementById('track-container');
    if (trackContainer) {
      trackContainer.remove();
    }
  }
}
