import './app.scss';
import { APP_CONTAINER_ID } from './constants';
import { renderHome } from './home';
import { getElementByIdOrThrow } from './utils';

export class App {
  private appElement: HTMLDivElement;

  constructor() {
    this.appElement = getElementByIdOrThrow<HTMLDivElement>(APP_CONTAINER_ID);
  }

  public async start() {
    await renderHome(this.appElement);
  }
}
