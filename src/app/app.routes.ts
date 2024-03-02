import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TrackComponent } from './track/track.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'track/:id', component: TrackComponent },
];
