import {
  APP_CONTAINER_ID,
  DASHBOARD_CONTAINER_ID,
  MAP_CONTAINER_ID,
  TIMELINE_CONTAINER_ID,
  TITLE_CONTAINER_ID,
} from './constants';
import './style.css';
import { getElementByIdOrThrow } from './utils';
import { WorldMap } from './world-map';

export const bootstrapApp = async (): Promise<void> => {
  const appElement = getElementByIdOrThrow(APP_CONTAINER_ID);

  appElement.innerHTML = `
    <div id="${DASHBOARD_CONTAINER_ID}">
      <div id="${TITLE_CONTAINER_ID}">
        <h1>F1 World Championship Circuits</h1>
      </div>
      <div id="${MAP_CONTAINER_ID}">
      </div>
      <div id="${TIMELINE_CONTAINER_ID}">
      </div>
    </div>
  `;

  const worldMap = new WorldMap();

  await worldMap.drawWorldMap();
  await worldMap.drawYearSelector();
  await worldMap.drawCircuitMarkers();
};
