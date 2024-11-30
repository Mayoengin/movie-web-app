import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rate-chip',
  standalone: true,
  imports: [],
  templateUrl: './rate-chip.component.html',
  styleUrl: './rate-chip.component.scss'
})
export class RateChipComponent implements OnInit {
  @Input() rate: number=0;
  @Input() placeDesimal: number=0;
  actualNmber: string = '';

  ngOnInit(): void {
    
    this.actualNmber = this.rate.toFixed(this.placeDesimal);
  }
}
