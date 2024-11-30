import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieSegmentComponent } from './movies-segment.component';

describe('MoviesSegmentComponent', () => {
  let component: MovieSegmentComponent;
  let fixture: ComponentFixture<MovieSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieSegmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieSegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
