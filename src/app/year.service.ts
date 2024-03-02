import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class YearService {
  private yearSubject = new BehaviorSubject<number>(2023);
  public year$ = this.yearSubject.asObservable();

  constructor() {}

  public setYear(year: number): void {
    this.yearSubject.next(year);
  }

  public getYear(): number {
    return this.yearSubject.getValue();
  }
}
