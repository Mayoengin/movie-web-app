import { Component, Input } from '@angular/core';
import { MovieCardInterfaceConfig } from '../../interfaces/ui-configs/movie-card-interfrace-cofig';
import { RateChipComponent } from "../rate-chip/rate-chip.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [RateChipComponent, CommonModule],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent {
  @Input() config!: MovieCardInterfaceConfig;
  @Input() rate: number = 0;
  @Input() placeDesimal: number = 0;
  actualNmber: string = '';

  constructor(private router: Router) {} // Inject Router

  ngOnInit(): void {
    this.actualNmber = this.rate.toFixed(this.placeDesimal);
  }

  navigateToDetails(): void {
    // Navigate to the movie details page with the movie ID
    this.router.navigate(['/movie', this.config.id]);
  }
}
