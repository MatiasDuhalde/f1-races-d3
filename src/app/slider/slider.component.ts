import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent<T> implements OnInit, OnChanges, OnDestroy {
  @Input() options: T[] = [];
  @Input() value: T;

  currentIndex: number;
  private valueSubject: BehaviorSubject<T>;
  value$: Observable<T>;

  constructor() {}

  ngOnInit(): void {
    this.currentIndex = this.options.indexOf(this.value);
    this.valueSubject = new BehaviorSubject<T>(this.value);
    this.value$ = this.valueSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.valueSubject.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && changes['options'].currentValue) {
      this.currentIndex = this.options.indexOf(this.value);
    }
  }

  public setIndex(newIndex: number): void {
    this.currentIndex = newIndex;
    this.updateValue();
  }

  public updateValue(): void {
    this.value = this.options[this.currentIndex];
  }

  public emitValue(): void {
    this.valueSubject.next(this.value);
  }

  public nextValue(): void {
    if (this.currentIndex < this.options.length - 1) {
      this.setIndex(this.currentIndex + 1);
      this.emitValue();
    }
  }

  public previousValue(): void {
    if (this.currentIndex > 0) {
      this.setIndex(this.currentIndex - 1);
      this.emitValue();
    }
  }
}
