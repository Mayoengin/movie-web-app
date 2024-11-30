export interface MovieCardInterfaceConfig {
  id: number;
  img: string; // Primary image
  additionalImg?: string; // Secondary image
  rateL: number;
  movieName: string;
  mediaType: string;
  overview: string;
  releaseDate: string;
  runtime?: string;
  genres?: string[];
  firstAirDate?: string;
  lastAirDate?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
}
