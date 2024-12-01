import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  AfterViewInit,
  HostListener,
  Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavIntemConfig } from '../../interfaces/ui-configs/nav-item-config-interface';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements AfterViewInit {
  @Output() navbarHeight = new EventEmitter<number>(); // Output property to emit navbar height

  menuOpen: boolean = false;

  navitems: NavIntemConfig[] = [
    { name: 'Movies', path: 'movies', active: true },
    { name: 'TV Shows', path: 'tv-shows', active: false }
  ];

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  selectItem(nav: NavIntemConfig) {
    this.navitems.map((item: NavIntemConfig) => (item.active = nav.name === item.name));
    this.menuOpen = false; // Close the menu when an item is selected
  }

  ngAfterViewInit() {
    const height = this.elementRef.nativeElement.offsetHeight; // Get the height of the navbar
    this.navbarHeight.emit(height); // Emit the height to the parent component
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.menuOpen) {
      this.menuOpen = false; // Close the menu when clicking outside of it
    }
  }
}
