import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TestComponent } from './pages/test/test.component';
import { DetailsComponent } from './pages/details/details.component'; // Import the new component
import { MovieSegmentComponent } from './pages/movies-segment/movies-segment.component'; // New movies page
import { TvShowsComponent } from './pages/tv-shows/tv-shows.component'; // New component

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'test', component: TestComponent },
  { path: 'movies', component: MovieSegmentComponent }, // Route for all movies
  { path: 'tv-shows', component: TvShowsComponent }, // Route for all TV shows
  { path: 'movie/:id', component: DetailsComponent }, // Route for movie details
  { path: 'tv/:id', component: DetailsComponent }, // Route for TV show details
  { path: '**', redirectTo: 'home' },
];
