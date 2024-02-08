import { DataService } from '../../data';
import { Slider } from '../components/slider';
import { WorldMap } from '../components/world-map';
import './home.scss';
import { View } from './view';

export class Home extends View {
  public static HOME_CONTAINER_ID = 'home-container';
  public static HOME_TITLE_CONTAINER_ID = 'home-title-container';
  public static HOME_WORLD_MAP_CONTAINER_ID = 'home-world-map-container';
  public static HOME_CONTROLS_CONTAINER_ID = 'home-controls-container';

  private yearSlider: Slider<number> | undefined;
  private worldMap: WorldMap | undefined;

  public async render(element: HTMLDivElement): Promise<void> {
    const homeContainer = document.createElement('div');
    homeContainer.id = Home.HOME_CONTAINER_ID;

    const homeTitleContainer = document.createElement('div');
    homeTitleContainer.id = Home.HOME_TITLE_CONTAINER_ID;
    const homeTitle = document.createElement('h1');
    homeTitle.innerText = 'F1 World Championship Circuits';
    homeTitleContainer.appendChild(homeTitle);

    const homeWorldMapContainer = document.createElement('div');
    homeWorldMapContainer.id = Home.HOME_WORLD_MAP_CONTAINER_ID;

    const homeControlsContainer = document.createElement('div');
    homeControlsContainer.id = Home.HOME_CONTROLS_CONTAINER_ID;

    homeContainer.appendChild(homeTitleContainer);
    homeContainer.appendChild(homeWorldMapContainer);
    homeContainer.appendChild(homeControlsContainer);
    element.appendChild(homeContainer);

    const seasons = await DataService.getInstance().getSeasons();
    const years = seasons.map((season) => season.year).sort();

    this.yearSlider = new Slider(years);

    this.yearSlider.render(homeControlsContainer);

    this.yearSlider.subscribe(async (year) => {
      this.app.yearSubject.next(year);
    });

    this.worldMap = new WorldMap(this.app);

    await this.worldMap.render(homeWorldMapContainer);
  }

  public destroy(): void {
    const homeContainer = document.getElementById(Home.HOME_CONTAINER_ID);
    if (homeContainer) {
      homeContainer.remove();
    }

    this.yearSlider?.destroy();
    this.worldMap?.destroy();
  }
}
