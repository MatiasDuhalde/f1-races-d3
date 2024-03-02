import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RaceComponent } from './race/race.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'circuit/:id', component: RaceComponent },
];
