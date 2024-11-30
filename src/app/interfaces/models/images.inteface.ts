export interface ImagesResponse {
    backdrops: Array<{
      file_path: string;
      aspect_ratio: number;
      height: number;
      width: number;
      iso_639_1: string | null;
      vote_average: number;
      vote_count: number;
    }>;
    posters: Array<{
      file_path: string;
      aspect_ratio: number;
      height: number;
      width: number;
      iso_639_1: string | null;
      vote_average: number;
      vote_count: number;
    }>;
  }
  