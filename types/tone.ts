export type Tone = {
  id: string;
  title?: string;
  description?: string;
  genres?: string[];
  instruments?: string[];
  image?: string;
  createdBy?: string;
  createdAt?: any;

  author_name?: string;
  author_image_url?: string;

  music_url?: string;
  review_count?: number;
  average_rating?: number;
};