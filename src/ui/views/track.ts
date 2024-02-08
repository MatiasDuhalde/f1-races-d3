import { Circuit, DataService } from '../../data';
import { App } from '../app';
import { Slider } from '../components/slider';
import { View } from './view';

export class Track extends View {
  public static TRACK_CONTROLS_CONTAINER_ID = 'track-controls-container';

  private circuit: Circuit;
  private yearSlider: Slider<number> | undefined;

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
    controlsContainerElement.id = Track.TRACK_CONTROLS_CONTAINER_ID;

    trackContainer.appendChild(trackTitle);
    trackContainer.appendChild(trackMapContainer);
    trackContainer.appendChild(controlsContainerElement);
    element.appendChild(trackContainer);

    const dataService = DataService.getInstance();

    const seasons = await dataService.getSeasons();
    const years = seasons.map((season) => season.year).sort();

    this.yearSlider = new Slider(years, this.app.getYear() || undefined);
    this.yearSlider.render(controlsContainerElement);

    this.yearSlider.subscribe(async (year) => {
      this.app.yearSubject.next(year);
    });
  }

  public destroy(): void {
    const trackContainer = document.getElementById('track-container');
    if (trackContainer) {
      trackContainer.remove();
    }

    this.yearSlider?.destroy();
  }
}
