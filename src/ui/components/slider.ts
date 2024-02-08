import { Subject } from 'rxjs';
import { UIElement } from '../ui-element';
import './slider.scss';

export class Slider<T extends { toString: () => string }> implements UIElement {
  public static CONTROLS_ROW_CLASS = 'controls-row';

  private containerElement: HTMLDivElement | undefined = undefined;
  private options: T[];
  private index = 0;
  private valueSubject: Subject<T> = new Subject<T>();

  public static SLIDER_INPUT_ID = 'slider-input';
  public static SLIDER_CLASS = 'slider';
  public static DATALIST_ID = 'tickmarks';

  public constructor(options: T[], startingValue: T = options[options.length - 1]) {
    this.options = options;
    this.setIndex(this.options.indexOf(startingValue));
  }

  private setIndex(index: number): void {
    this.index = index;
    this.valueSubject.next(this.options[index]);
  }

  public subscribe(callback: (value: T) => void): void {
    this.valueSubject.subscribe(callback);
    this.valueSubject.next(this.options[this.index]);
  }

  public render(element: HTMLDivElement): void {
    this.containerElement = element;

    const input = document.createElement('input');
    input.type = 'range';
    input.id = Slider.SLIDER_INPUT_ID;
    input.className = Slider.SLIDER_CLASS;
    input.min = '0';
    input.max = (this.options.length - 1).toString();
    input.step = '1';
    input.setAttribute('list', Slider.DATALIST_ID);
    input.value = this.index.toString();

    const datalist = document.createElement('datalist');
    datalist.id = Slider.DATALIST_ID;

    for (const option of this.options) {
      const optionElement = document.createElement('option');
      optionElement.innerText = option.toString();
      datalist.appendChild(optionElement);
    }

    const label = document.createElement('label');
    label.htmlFor = Slider.SLIDER_INPUT_ID;
    label.textContent = this.options[this.index].toString();

    const leftArrow = document.createElement('button');
    leftArrow.textContent = '<';
    leftArrow.addEventListener('click', () => {
      if (this.index > 0) {
        this.setIndex(this.index - 1);
      }
    });

    const rightArrow = document.createElement('button');
    rightArrow.textContent = '>';
    rightArrow.addEventListener('click', () => {
      if (this.index < this.options.length - 1) {
        this.setIndex(this.index + 1);
      }
    });

    const sliderContainer = document.createElement('div');
    sliderContainer.className = Slider.CONTROLS_ROW_CLASS;

    sliderContainer.appendChild(leftArrow);
    sliderContainer.appendChild(input);
    sliderContainer.appendChild(rightArrow);
    sliderContainer.appendChild(datalist);

    const labelContainer = document.createElement('div');
    labelContainer.className = Slider.CONTROLS_ROW_CLASS;

    labelContainer.appendChild(label);

    this.containerElement.appendChild(sliderContainer);
    this.containerElement.appendChild(labelContainer);

    input.addEventListener('input', (event) => {
      // Each time the user moves the input, update the label
      const index = (event.target as HTMLInputElement).value;
      label.textContent = this.options[+index].toString();
    });

    input.addEventListener('change', (event) => {
      // Once the change is complete, update the selected year and redraw the circuit markers
      const index = (event.target as HTMLInputElement).value;
      this.setIndex(+index);
    });

    this.valueSubject.subscribe((value) => {
      this.index = this.options.indexOf(value);
      input.value = this.index.toString();
      label.textContent = value.toString();
    });
  }

  public destroy(): void {
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
    }

    this.valueSubject.complete();
  }
}
