import { Subject } from 'rxjs';
import { Circuit } from '../data';
import './app.scss';
import { getElementByIdOrThrow } from './utils';
import { Home, Track, View } from './views';

export class App {
  public static APP_CONTAINER_ID = 'app';

  private appElement: HTMLDivElement;
  private currentView?: View;
  private year: number | null = null;

  public currentViewSubject = new Subject<View>();
  public yearSubject = new Subject<number | null>();

  constructor() {
    this.appElement = getElementByIdOrThrow<HTMLDivElement>(App.APP_CONTAINER_ID);

    this.currentViewSubject.subscribe(async (view: View) => {
      if (this.currentView) {
        this.currentView.destroy();
      }
      view.render(this.appElement);
      this.currentView = view;
    });

    this.yearSubject.subscribe((year: number | null) => {
      this.year = year;
    });
  }

  public async start(): Promise<void> {
    await this.goHome();
  }

  public async changeView(view: View): Promise<void> {
    this.currentViewSubject.next(view);
  }

  public async goHome(): Promise<void> {
    const homeView = new Home(this);
    await this.changeView(homeView);
  }

  public async displayTrack(circuit: Circuit): Promise<void> {
    const trackView = new Track(this, circuit);
    await this.changeView(trackView);
  }

  public getYear(): number | null {
    return this.year;
  }

  public setYear(year: number | null): void {
    this.yearSubject.next(year);
  }
}
