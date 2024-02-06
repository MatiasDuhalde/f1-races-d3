import {
  HOME_CONTAINER_ID,
  HOME_TITLE_CONTAINER_ID,
  HOME_WORLD_MAP_CONTAINER_ID,
} from '../constants';
import { WorldMap } from '../world-map';
import './home.scss';
import { View } from './view';

export class Home extends View {
  public async render(element: HTMLDivElement): Promise<void> {
    const homeContainer = document.createElement('div');
    homeContainer.id = HOME_CONTAINER_ID;

    const homeTitleContainer = document.createElement('div');
    homeTitleContainer.id = HOME_TITLE_CONTAINER_ID;
    const homeTitle = document.createElement('h1');
    homeTitle.innerText = 'F1 World Championship Circuits';
    homeTitleContainer.appendChild(homeTitle);

    const homeWorldMapContainer = document.createElement('div');
    homeWorldMapContainer.id = HOME_WORLD_MAP_CONTAINER_ID;

    homeContainer.appendChild(homeTitleContainer);
    homeContainer.appendChild(homeWorldMapContainer);
    element.appendChild(homeContainer);

    const worldMap = new WorldMap(this.app);

    await worldMap.render(homeWorldMapContainer);
  }

  public destroy(): void {
    const homeContainer = document.getElementById(HOME_CONTAINER_ID);
    if (homeContainer) {
      homeContainer.remove();
    }
  }
}
