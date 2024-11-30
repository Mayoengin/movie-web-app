export interface MovieDetails {
    id: number;
    title?: string;
    runtime?: number | string;
    overview?: string;
    [key: string]: any; // For any additional fields
  }
  