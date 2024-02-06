import type { App } from '../app';

export abstract class View {
  protected app: App;

  constructor(app: App) {
    this.app = app;
  }

  abstract render(element: HTMLDivElement): Promise<void> | void;

  abstract destroy(): void;
}
