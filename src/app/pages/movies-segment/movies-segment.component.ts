import { Component, OnInit } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { MoviesComponent } from '../../components/movies/movies.component';
import { GenericHttpService } from '../../services/generic-http.service';
import { HttpClientModule } from '@angular/common/http';
import { Endpoints } from '../../endpoints/endpoints';
import { Result, TRENDS } from '../../interfaces/models/trends.interface';
import { MovieCardInterfaceConfig } from '../../interfaces/ui-configs/movie-card-interfrace-cofig';
import { SegmentedControlComponent } from "../../components/segmented-control/segmented-control.component";
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SegmentedControlConfig } from '../../interfaces/ui-configs/segmented-control-config-interface';
import { forkJoin, catchError, of, map } from 'rxjs';

@Component({
  selector: 'app-movie-segment',
  standalone: true,
  providers: [GenericHttpService],
  imports: [InputComponent, MoviesComponent, HttpClientModule, CommonModule, SegmentedControlComponent],
  templateUrl: './movies-segment.component.html',
  styleUrls: ['./movies-segment.component.scss']
})
export class MovieSegmentComponent implements OnInit {
  segment: SegmentedControlConfig[] = [
    { name: 'All', active: false },
    { name: 'Movies', active: true },
    { name: 'TV shows', active: false },
  ];
  title: string = 'Movies';
  moviecard: MovieCardInterfaceConfig[] = []; // Original list of movies
  filteredMovies: MovieCardInterfaceConfig[] = []; // Filtered list for search results

  constructor(private genericHttpService: GenericHttpService, private router: Router) {}

  ngOnInit(): void {
    console.log('Fetching movies...');
    this.genericHttpService.httpGet<TRENDS>(Endpoints.TRENDS).subscribe({
      next: (res: TRENDS) => {
        const movies = res.results
          .filter((item: Result) => item.media_type === 'movie')
          .map((item: Result) => ({
            id: item.id, // Ensure ID is mapped correctly
            img: `${Endpoints.IMAGE_Base}/w1280${item.backdrop_path}`,
            movieName: item.original_title || item.title || 'No Title Available',
            rateL: item.vote_average,
            mediaType: item.media_type,
            overview: item.overview,
            releaseDate: item.release_date || 'Unknown',
            runtime: 'Loading...',
          }));

        console.log('Mapped Movies:', movies);

        const detailRequests = movies.map((movie) =>
          this.getMovieDetails(movie.id).pipe(
            catchError(() => of({ id: movie.id, runtime: 'Unknown', genres: [], additionalImg: '' }))
          )
        );

        forkJoin(detailRequests).subscribe((details) => {
          console.log('Fetched movie details:', details);

          this.moviecard = movies.map((movie) => {
            const detailsData = details.find((detail) => detail.id === movie.id); // Match by ID
            return {
              ...movie,
              runtime: detailsData?.runtime || 'Unknown',
              genres: detailsData?.genres || [],
              additionalImg: detailsData?.additionalImg || '', // Secondary image fallback
            };
          });

          this.filteredMovies = [...this.moviecard];
          console.log('Final movie card:', this.moviecard);
        });
      },
      error: (error) => {
        console.error('Error fetching movies:', error);
      },
    });
  }

  getMovieDetails(id: number): any {
    const detailsEndpoint = Endpoints.MOVIE_ID(`${id}`);
    const imagesEndpoint = Endpoints.MOVIE_IMAGES(`${id}`);

    return forkJoin({
      details: this.genericHttpService.httpGet<any>(detailsEndpoint),
      images: this.genericHttpService.httpGet<any>(imagesEndpoint),
    }).pipe(
      map(({ details, images }) => ({
        id: details.id, // Extract ID from the details response
        runtime: details.runtime ? `${details.runtime} minutes` : 'Unknown',
        genres: details.genres ? details.genres.map((genre: any) => genre.name) : [],
        additionalImg: images.backdrops?.[1]?.file_path
          ? `${Endpoints.IMAGE_Base}/w1280${images.backdrops[1].file_path}`
          : '', // Fallback for secondary image
      }))
    );
  }

  navigateToDetails(item: MovieCardInterfaceConfig): void {
    console.log('Navigating to movie details:', item);
    this.router.navigate(['/movie', item.id], {
      queryParams: {
        id: item.id, // Ensure this is passed
        name: item.movieName,
        img: item.img,
        additionalImg: item.additionalImg || '', // Secondary image fallback
        type: item.mediaType,
        overview: item.overview,
        releaseDate: item.releaseDate,
        runtime: item.runtime,
        genres: item.genres?.join(',') || '', // Join genres into a string
      },
    });
  }

  onSearch(term: string): void {
    term = term.toLowerCase();
    this.filteredMovies = this.moviecard.filter((movie) =>
      movie.movieName.toLowerCase().includes(term)
    );
  }
}
