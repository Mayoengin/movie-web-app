import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SegmentedControlConfig } from '../../interfaces/ui-configs/segmented-control-config-interface';

@Component({
  selector: 'app-segmented-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './segmented-control.component.html',
  styleUrls: ['./segmented-control.component.scss'],
})
export class SegmentedControlComponent {
  @Input() config: SegmentedControlConfig[] = [];

  constructor(private router: Router) {}

  selectItem(segment: SegmentedControlConfig): void {
    // Update active state
    this.config.forEach((item) => (item.active = segment.name === item.name));

    // Navigate based on the selected segment
    switch (segment.name) {
      case 'All': // For "All" segment
        this.router.navigate(['/home']);
        break;
      case 'Movies':
        this.router.navigate(['/movies']);
        break;
      case 'TV shows':
        this.router.navigate(['/tv-shows']);
        break;
      default:
        console.error('Unknown segment:', segment.name);
    }
  }
}
