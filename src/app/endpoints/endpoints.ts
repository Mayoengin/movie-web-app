export class Endpoints {
  static MOVIES: string = 'discover/movie';
  static TV_SHOWS: string = 'discover/tv';
  static MOVIE_ID = (movie_id: string) => `movie/${movie_id}`;
  static TV_SHOW_ID = (series_id: string) => `tv/${series_id}`;
  static MOVIE_IMAGES = (movie_id: string) => `movie/${movie_id}/images`; // Endpoint to fetch movie images
  static TV_IMAGES = (series_id: string) => `tv/${series_id}/images`; // Endpoint to fetch TV show images
  static TRENDS: string = 'trending/all/day?language=en-US';
  static IMAGE_Base: string = 'https://image.tmdb.org/t/p/';
}
