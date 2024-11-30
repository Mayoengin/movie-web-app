import { Component } from '@angular/core';
import { NavBarComponent } from "../../components/nav-bar/nav-bar.component";
import { SegmentedControlComponent } from "../../components/segmented-control/segmented-control.component";
import { SegmentedControlConfig } from '../../interfaces/ui-configs/segmented-control-config-interface';
import { InputComponent } from "../../components/input/input.component";
import { RateChipComponent } from "../../components/rate-chip/rate-chip.component";
import { MoviesComponent } from "../../components/movies/movies.component";
import { MovieCardInterfaceConfig } from '../../interfaces/ui-configs/movie-card-interfrace-cofig';

@Component({
  selector: 'app-test',
  standalone: true, // Declares that this is a standalone component
  imports: [NavBarComponent, SegmentedControlComponent, InputComponent, RateChipComponent, MoviesComponent], // Correct import for the NavBarComponent
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'] // Corrected 'styleUrl' to 'styleUrls'
})
export class TestComponent { 
  segment: SegmentedControlConfig[] = [
    {
      name: 'All',
      active: true
    },
    {
      name: 'Movies',
      active: false
    },
    {
      name: 'TVs shows',
      active: false
    }
  ];


}
