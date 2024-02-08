import type { App } from '../app';
import { UIElement } from '../ui-element';

export abstract class View implements UIElement {
  protected app: App;

  constructor(app: App) {
    this.app = app;
  }

  abstract render(element: HTMLDivElement): Promise<void> | void;

  abstract destroy(): void;
}
