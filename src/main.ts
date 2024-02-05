import { placeCircuits, placeWorldMap } from './map';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>F1 Circuits</h1>
    <div id="map-container">
    </div>
  </div>
`;

placeWorldMap(document.querySelector<HTMLDivElement>('#map-container')!);
placeCircuits();
