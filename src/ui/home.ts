import {
  HOME_CONTAINER_ID,
  HOME_TITLE_CONTAINER_ID,
  HOME_WORLD_MAP_CONTAINER_ID,
} from './constants';
import './home.scss';
import { WorldMap } from './world-map';

export const renderHome = async (element: HTMLDivElement): Promise<void> => {
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

  const worldMap = new WorldMap();

  await worldMap.drawWorldMap(homeWorldMapContainer);
};
