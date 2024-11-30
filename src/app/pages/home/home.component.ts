import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../../components/input/input.component';
import { MoviesComponent } from '../../components/movies/movies.component';
import { GenericHttpService } from '../../services/generic-http.service';
import { HttpClientModule } from '@angular/common/http';
import { Endpoints } from '../../endpoints/endpoints';
import { Result, TRENDS } from '../../interfaces/models/trends.interface';
import { MovieCardInterfaceConfig } from '../../interfaces/ui-configs/movie-card-interfrace-cofig';
import { SegmentedControlComponent } from '../../components/segmented-control/segmented-control.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SegmentedControlConfig } from '../../interfaces/ui-configs/segmented-control-config-interface';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ImagesResponse } from '../../interfaces/models/images.inteface';

@Component({
  selector: 'app-home',
  standalone: true,
  providers: [GenericHttpService],
  imports: [
    InputComponent,
    MoviesComponent,
    HttpClientModule,
    CommonModule,
    SegmentedControlComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  segment: SegmentedControlConfig[] = [
    { name: 'All', active: true },
    { name: 'Movies', active: false },
    { name: 'TV shows', active: false },
  ];
  title: string = 'All';
  moviecard: MovieCardInterfaceConfig[] = []; // Original list of movies and TV shows
  filteredMovies: MovieCardInterfaceConfig[] = []; // Filtered list for search results

  constructor(private genericHttpService: GenericHttpService, private router: Router) {}

  ngOnInit(): void {
    console.log('Fetching trending movies and shows...'); // Debug log
    this.genericHttpService.httpGet<TRENDS>(Endpoints.TRENDS).subscribe({
      next: (res: TRENDS) => {
        const moviesAndShows = res.results.map((item: Result) => ({
          id: item.id,
          img: `${Endpoints.IMAGE_Base}/w1280${item.backdrop_path}`,
          movieName: item.original_name || item.title || 'No Title Available',
          rateL: item.vote_average,
          mediaType: item.media_type, // Include the mediaType ('movie' or 'tv')
          overview: item.overview,
          releaseDate: item.release_date || item.first_air_date || 'Unknown',
          runtime: 'Loading...', // Initialize runtime as 'Loading...'
        }));

        console.log('Mapped movies and shows:', moviesAndShows);

        // Fetch details and images for both movies and TV shows
        const detailRequests = moviesAndShows.map((item) =>
          this.getMovieDetails(item.id, item.mediaType).pipe(
            catchError(() =>
              of({
                id: item.id,
                runtime: 'Unknown',
                genres: [],
                additionalImg: undefined,
                firstAirDate: undefined,
                lastAirDate: undefined,
                numberOfSeasons: undefined,
                numberOfEpisodes: undefined,
              })
            ) // Gracefully handle errors
          )
        );

        forkJoin(detailRequests).subscribe((details) => {
          console.log('Details fetched for all items:', details);

          this.moviecard = moviesAndShows.map((item) => {
            const detailsData = details.find((detail) => detail.id === item.id);
            if (item.mediaType === 'movie') {
              return {
                ...item,
                runtime: detailsData?.runtime || 'Unknown',
                genres: detailsData?.genres || [],
                additionalImg: detailsData?.additionalImg, // Include the secondary image
              };
            } else if (item.mediaType === 'tv') {
              return {
                ...item,
                firstAirDate: detailsData?.firstAirDate || 'Unknown',
                lastAirDate: detailsData?.lastAirDate || 'Unknown',
                numberOfSeasons: detailsData?.numberOfSeasons || 0,
                numberOfEpisodes: detailsData?.numberOfEpisodes || 0,
                genres: detailsData?.genres || [],
                additionalImg: detailsData?.additionalImg, // Include the secondary image
              };
            }
            return item;
          });

          this.filteredMovies = [...this.moviecard];
          console.log('Final moviecard with merged details:', this.moviecard);
        });
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  getMovieDetails(id: number, type: string): Observable<any> {
    const detailsEndpoint =
      type === 'movie' ? Endpoints.MOVIE_ID(`${id}`) : Endpoints.TV_SHOW_ID(`${id}`);
    const imagesEndpoint =
      type === 'movie' ? Endpoints.MOVIE_IMAGES(`${id}`) : Endpoints.TV_IMAGES(`${id}`);
  
    console.log(`Fetching details from ${detailsEndpoint} and images from ${imagesEndpoint}`);
  
    return forkJoin({
      details: this.genericHttpService.httpGet<any>(detailsEndpoint),
      images: this.genericHttpService.httpGet<ImagesResponse>(imagesEndpoint),
    }).pipe(
      map(({ details, images }) => {
        // Set the primary image from the backdrop_path
        const movieImg = details.backdrop_path
          ? `${Endpoints.IMAGE_Base}/w1280${details.backdrop_path}`
          : `${Endpoints.IMAGE_Base}/w1280${details.poster_path}`;
  
        // Set the secondary image from the first additional backdrop
        const additionalImg = images.backdrops?.[1]?.file_path
          ? `${Endpoints.IMAGE_Base}/w1280${images.backdrops[1].file_path}`
          : undefined;
  
        if (type === 'movie') {
          return {
            id: details.id,
            runtime: details.runtime ? `${details.runtime} minutes` : 'Unknown',
            genres: details.genres ? details.genres.map((genre: any) => genre.name) : [],
            movieImg, // Primary image
            additionalImg, // Secondary image
          };
        } else {
          return {
            id: details.id,
            firstAirDate: details.first_air_date || 'Unknown',
            lastAirDate: details.last_air_date || 'Unknown',
            numberOfSeasons: details.number_of_seasons || 0,
            numberOfEpisodes: details.number_of_episodes || 0,
            genres: details.genres ? details.genres.map((genre: any) => genre.name) : [],
            movieImg, // Primary image
            additionalImg, // Secondary image
          };
        }
      }),
      catchError((error) => {
        console.error('Error fetching details or images:', error);
        return of({
          id,
          runtime: 'Unknown',
          genres: [],
          movieImg: undefined,
          additionalImg: undefined,
          firstAirDate: 'Unknown',
          lastAirDate: 'Unknown',
          numberOfSeasons: 0,
          numberOfEpisodes: 0,
        });
      })
    );
  }
  

  onSearch(term: string): void {
    console.log('Search term:', term);
    term = term.toLowerCase();
    this.filteredMovies = this.moviecard.filter((movie) =>
      movie.movieName.toLowerCase().includes(term)
    );
    console.log('Filtered Movies:', this.filteredMovies);
  }

  navigateToDetails(item: MovieCardInterfaceConfig): void {
    console.log('Navigating to details with:', item); // Debug log
    const route = item.mediaType === 'movie' ? '/movie' : '/tv';
    this.router.navigate([route, item.id], {
      queryParams: {
        id: item.id, // Ensure this is passed
        name: item.movieName,
        img: item.img,
        additionalImg: item.additionalImg,
        type: item.mediaType,
        overview: item.overview,
        releaseDate: item.releaseDate,
        runtime: item.runtime,
        genres: item.genres?.join(',') || '',
        firstAirDate: item.firstAirDate,
        lastAirDate: item.lastAirDate,
        numberOfSeasons: item.numberOfSeasons,
        numberOfEpisodes: item.numberOfEpisodes,
      },
    });
  }
  
}  