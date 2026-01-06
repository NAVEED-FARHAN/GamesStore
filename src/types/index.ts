export interface Game {
    id: number;
    title: string;
    description: string;
    releaseDate: string;
    rating: number;
    genres: string[];
    platforms: string[];
    coverImageUrl: string;
    bannerImageUrl: string;
    trailerUrl: string;
    moreInfoUrl: string;
    screenshots: string[];
    sortOrder?: number;
}
