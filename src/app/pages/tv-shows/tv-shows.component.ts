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
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-tv-shows',
  standalone: true,
  providers: [GenericHttpService],
  imports: [
    InputComponent,
    MoviesComponent,
    HttpClientModule,
    CommonModule,
    SegmentedControlComponent,
  ],
  templateUrl: './tv-shows.component.html',
  styleUrls: ['./tv-shows.component.scss'],
})
export class TvShowsComponent implements OnInit {
  segment: SegmentedControlConfig[] = [
    { name: 'All', active: false },
    { name: 'Movies', active: false },
    { name: 'TV shows', active: true },
  ];
  title: string = 'TV Shows';
  tvCard: MovieCardInterfaceConfig[] = []; // Original list of TV shows
  filteredTvShows: MovieCardInterfaceConfig[] = []; // Filtered list for search results

  constructor(private genericHttpService: GenericHttpService, private router: Router) {}

  ngOnInit(): void {
    console.log('Fetching TV shows...');
    this.genericHttpService.httpGet<TRENDS>(Endpoints.TRENDS).subscribe({
      next: (res: TRENDS) => {
        console.log('Raw API response for TV shows:', res.results);

        const tvShows = res.results
          .filter((item: Result) => item.media_type === 'tv') // Filter TV shows only
          .map((item: Result) => ({
            id: item.id,
            img: `${Endpoints.IMAGE_Base}/w1280${item.backdrop_path}`,
            movieName: item.original_name || item.title || 'No Title Available',
            rateL: item.vote_average,
            mediaType: item.media_type,
            overview: item.overview,
            releaseDate: item.first_air_date || 'Unknown',
            additionalImg: '', // Initialize additionalImg
          }));

        console.log('Mapped TV Shows:', tvShows);

        const detailRequests = tvShows.map((tv) =>
          this.getTvShowDetails(tv.id).pipe(
            catchError(() =>
              of({
                id: tv.id,
                firstAirDate: 'Unknown',
                lastAirDate: 'Unknown',
                numberOfSeasons: 0,
                numberOfEpisodes: 0,
                genres: [],
                additionalImg: '', // Fallback for secondary image
              })
            )
          )
        );

        forkJoin(detailRequests).subscribe((details) => {
          console.log('Fetched details for all TV shows:', details);

          this.tvCard = tvShows.map((tv) => {
            const detailsData = details.find((detail) => detail.id === tv.id);
            return {
              ...tv,
              firstAirDate: detailsData?.firstAirDate || 'Unknown',
              lastAirDate: detailsData?.lastAirDate || 'Unknown',
              numberOfSeasons: detailsData?.numberOfSeasons || 0,
              numberOfEpisodes: detailsData?.numberOfEpisodes || 0,
              genres: detailsData?.genres || [],
              additionalImg: detailsData?.additionalImg || '', // Assign secondary image
            };
          });

          this.filteredTvShows = [...this.tvCard];
          console.log('Final TV card:', this.tvCard);
        });
      },
      error: (error) => {
        console.error('Error fetching TV shows:', error);
      },
    });
  }

  getTvShowDetails(id: number): any {
    const detailsEndpoint = Endpoints.TV_SHOW_ID(`${id}`);
    const imagesEndpoint = Endpoints.TV_IMAGES(`${id}`);

    console.log(`Fetching details for TV Show ID: ${id}`);
    console.log(`Details endpoint: ${detailsEndpoint}`);
    console.log(`Images endpoint: ${imagesEndpoint}`);

    return forkJoin({
      details: this.genericHttpService.httpGet<any>(detailsEndpoint),
      images: this.genericHttpService.httpGet<any>(imagesEndpoint),
    }).pipe(
      map(({ details, images }) => {
        console.log('Details fetched for TV Show:', details);
        console.log('Images fetched for TV Show:', images);

        return {
          id: details.id,
          firstAirDate: details.first_air_date || 'Unknown',
          lastAirDate: details.last_air_date || 'Unknown',
          numberOfSeasons: details.number_of_seasons || 0,
          numberOfEpisodes: details.number_of_episodes || 0,
          genres: details.genres ? details.genres.map((genre: any) => genre.name) : [],
          additionalImg: images.backdrops?.[1]?.file_path
            ? `${Endpoints.IMAGE_Base}/w1280${images.backdrops[1].file_path}`
            : '', // Secondary image
        };
      }),
      catchError((error) => {
        console.error('Error fetching details or images for TV Show:', error);
        return of({
          id,
          firstAirDate: 'Unknown',
          lastAirDate: 'Unknown',
          numberOfSeasons: 0,
          numberOfEpisodes: 0,
          genres: [],
          additionalImg: '',
        });
      })
    );
  }

  navigateToDetails(item: MovieCardInterfaceConfig): void {
    console.log('Navigating to TV show details:', item);
    this.router.navigate(['/tv', item.id], {
      queryParams: {
        id: item.id, // Ensure this is passed
        name: item.movieName,
        img: item.img,
        additionalImg: item.additionalImg, // Pass secondary image
        type: item.mediaType,
        overview: item.overview,
        releaseDate: item.releaseDate,
        firstAirDate: item.firstAirDate,
        lastAirDate: item.lastAirDate,
        numberOfSeasons: item.numberOfSeasons,
        numberOfEpisodes: item.numberOfEpisodes,
        genres: item.genres?.join(',') || '',
      },
    });
  }

  onSearch(term: string): void {
    console.log('Search term:', term);
    term = term.toLowerCase();
    this.filteredTvShows = this.tvCard.filter((tv) =>
      tv.movieName.toLowerCase().includes(term)
    );
    console.log('Filtered TV Shows:', this.filteredTvShows);
  }
}
