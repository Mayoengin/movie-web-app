import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  movieId!: number;
  movieName!: string;
  movieImg!: string;
  additionalImg!: string;
  movieType!: string;
  overview!: string;
  releaseDate!: string;
  runtime: number | undefined;
  genres: string[] = [];
  firstAirDate: any;
  lastAirDate: any;
  numberOfSeasons: any;
  numberOfEpisodes: any;
  trailerUrl!: SafeResourceUrl;
  showTrailer: boolean = false;
  isMobileView: boolean = window.innerWidth <= 768; // Initial check for mobile view

  // Overview Popup State
  isOverviewPopupVisible: boolean = false;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.isMobileView = window.innerWidth <= 768; // Update flag on window resize
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.movieId = +params['id'];
      if (!this.movieId || isNaN(this.movieId)) {
        console.error('Invalid or missing movie ID.');
        return;
      }

      this.movieName = params['name'];
      this.movieImg = params['img'];
      this.additionalImg = params['additionalImg'];
      this.movieType = params['type'];
      this.overview = params['overview'];
      this.releaseDate = params['releaseDate'];
      this.runtime = params['runtime'];
      this.genres = params['genres'] ? params['genres'].split(',') : [];

      if (this.movieType === 'tv') {
        this.firstAirDate = params['firstAirDate'];
        this.lastAirDate = params['lastAirDate'];
        this.numberOfSeasons = params['numberOfSeasons'];
        this.numberOfEpisodes = params['numberOfEpisodes'];
      }

      this.fetchTrailer(this.movieId);
    });
  }

  fetchTrailer(id: number): void {
    const apiUrl =
      this.movieType === 'movie'
        ? `https://api.themoviedb.org/3/movie/${id}/videos`
        : `https://api.themoviedb.org/3/tv/${id}/videos`;
  
    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${environment.token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.results && Array.isArray(data.results)) {
          const trailer = data.results.find(
            (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
          );
          if (trailer) {
            this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube.com/embed/${trailer.key}`
            );
          } else {
            console.warn('No YouTube trailer found.');
          }
        } else {
          console.warn('Invalid or empty video results from API.', data);
        }
      })
      .catch((error) => {
        console.error('Error fetching trailer:', error.message);
      });
  }
  

  openTrailerPopup(): void {
    this.showTrailer = true;
  }

  closeTrailerPopup(): void {
    this.showTrailer = false;
  }

  // Overview Popup Handlers
  showOverviewPopup(): void {
    this.isOverviewPopupVisible = true;
  }

  hideOverviewPopup(): void {
    this.isOverviewPopupVisible = false;
  }
}
