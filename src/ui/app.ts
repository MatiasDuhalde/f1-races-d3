import { Subject } from 'rxjs';
import { Circuit } from '../data';
import './app.scss';
import { APP_CONTAINER_ID } from './constants';
import { getElementByIdOrThrow } from './utils';
import { Home, Track, View } from './views';

export class App {
  private appElement: HTMLDivElement;
  private currentView?: View;
  private currentViewSubject = new Subject<View>();

  constructor() {
    this.appElement = getElementByIdOrThrow<HTMLDivElement>(APP_CONTAINER_ID);

    this.currentViewSubject.subscribe(async (view) => {
      if (this.currentView) {
        this.currentView.destroy();
      }
      view.render(this.appElement);
      this.currentView = view;
    });
  }

  public async start() {
    await this.goHome();
  }

  public async changeView(view: View) {
    this.currentViewSubject.next(view);
  }

  public async goHome() {
    const homeView = new Home(this);
    await this.changeView(homeView);
  }

  public async displayTrack(circuit: Circuit, year: number) {
    const trackView = new Track(this, circuit, year);
    await this.changeView(trackView);
  }
}
