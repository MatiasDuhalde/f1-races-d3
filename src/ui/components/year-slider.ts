import * as d3 from 'd3';
import { DataService, Season } from '../../data';
import { App } from '../app';
import { CONTROLS_ROW_CLASS } from '../constants';
import './year-slider.scss';

export class YearSlider {
  private containerElement: HTMLDivElement | undefined = undefined;
  private app: App;

  public constructor(app: App) {
    this.app = app;
  }

  private async getSeasons(): Promise<Season[]> {
    const dataService = DataService.getInstance();
    return dataService.getSeasons();
  }

  public async render(element: HTMLDivElement): Promise<void> {
    this.containerElement = element;

    const seasons = await this.getSeasons();
    const [min, max] = d3.extent(seasons, (d) => d.year) as [number, number];

    const appYear = this.app.getYear();

    if (appYear === null) {
      this.app.setYear(max);
    }

    const year = appYear || max;

    const input = document.createElement('input');
    input.type = 'range';
    input.id = 'year-selector';
    input.name = 'year';
    input.min = min.toString();
    input.max = max.toString();
    input.value = year.toString();

    const label = document.createElement('label');
    label.htmlFor = 'year-selector';
    label.textContent = seasons[seasons.length - 1].year.toString();

    const leftArrow = document.createElement('button');
    leftArrow.textContent = '<';
    leftArrow.addEventListener('click', () => {
      const year = this.app.getYear();
      if (year && year > min) {
        this.app.setYear(year - 1);
      }
    });

    const rightArrow = document.createElement('button');
    rightArrow.textContent = '>';
    rightArrow.addEventListener('click', () => {
      const year = this.app.getYear();
      if (year && year < max) {
        this.app.setYear(year + 1);
      }
    });

    const sliderContainer = document.createElement('div');
    sliderContainer.className = CONTROLS_ROW_CLASS;

    sliderContainer.appendChild(leftArrow);
    sliderContainer.appendChild(input);
    sliderContainer.appendChild(rightArrow);

    const labelContainer = document.createElement('div');
    sliderContainer.className = CONTROLS_ROW_CLASS;

    labelContainer.appendChild(label);

    this.containerElement.appendChild(sliderContainer);
    this.containerElement.appendChild(labelContainer);

    input.addEventListener('input', (event) => {
      // Each time the user moves the input, update the label
      const year = (event.target as HTMLInputElement).value;
      label.textContent = year;
    });

    input.addEventListener('change', (event) => {
      // Once the change is complete, update the selected year and redraw the circuit markers
      const year = (event.target as HTMLInputElement).value;
      this.app.setYear(+year);
    });

    this.app.yearSubject.subscribe((year) => {
      if (year !== null) {
        input.value = year.toString();
        label.textContent = year.toString();
      }
    });
  }
}
