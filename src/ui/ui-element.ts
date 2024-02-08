export interface UIElement {
  render(element: HTMLDivElement): Promise<void> | void;

  destroy(): void;
}
