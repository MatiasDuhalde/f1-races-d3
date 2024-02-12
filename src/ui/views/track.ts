import { Circuit, DataService, Race } from '../../data';
import { App } from '../app';
import { Slider } from '../components/slider';
import './track.scss';
import { View } from './view';

export class Track extends View {
  public static TRACK_CONTAINER_ID = 'track-container';
  public static TRACK_TITLE_CONTAINER_ID = 'track-title-container';
  public static TRACK_MAP_CONTAINER_ID = 'track-map-container';
  public static TRACK_CONTROLS_CONTAINER_ID = 'track-controls-container';

  private circuit: Circuit;
  private yearSlider: Slider<number> | undefined;

  public constructor(app: App, circuit: Circuit) {
    super(app);
    this.circuit = circuit;
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
    const trackContainer = document.createElement('div');
    trackContainer.id = Track.TRACK_CONTAINER_ID;

    const trackTitleContainer = document.createElement('div');
    trackTitleContainer.id = Track.TRACK_TITLE_CONTAINER_ID;
    const trackTitle = document.createElement('h1');
    trackTitle.innerText = `${this.circuit.name}`;

    const backButton = document.createElement('button');
    backButton.innerText = 'Back';
    backButton.onclick = () => this.app.goHome();
    trackTitleContainer.appendChild(backButton);

    trackTitleContainer.appendChild(trackTitle);

    const trackMapContainer = document.createElement('div');
    trackMapContainer.id = Track.TRACK_MAP_CONTAINER_ID;

    const controlsContainerElement = document.createElement('div');
    controlsContainerElement.id = Track.TRACK_CONTROLS_CONTAINER_ID;

    trackContainer.appendChild(trackTitleContainer);
    trackContainer.appendChild(trackMapContainer);
    trackContainer.appendChild(controlsContainerElement);
    element.appendChild(trackContainer);

    const dataService = DataService.getInstance();

    const seasons = await dataService.getSeasons();
    const races = await dataService.getRaces();

    const filteredRaces = races.filter((race) => race.circuitId === this.circuit.circuitId);

    const filteredSeasons = seasons.filter((season) =>
      filteredRaces.some((race) => race.year === season.year),
    );

    const years = filteredSeasons.map((season) => season.year).sort();

    this.yearSlider = new Slider(years, this.app.getYear() || undefined);
    this.yearSlider.render(controlsContainerElement);

    this.yearSlider.subscribe(async (year) => {
      this.app.yearSubject.next(year);
    });

    this.app.yearSubject.subscribe(async () => {
      const race = await this.getRaceByYearAndCircuitId();
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
