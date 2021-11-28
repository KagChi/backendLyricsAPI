export interface geniusSearchResult {
    meta: {
        status: 200 | 404;
    };
    response: {
        hits: geniusSearchHitsResponse[];
    };
}

export interface geniusSongResult {
    meta: {
        status: 200 | 404;
    };
    response: {
        song?: {
            header_image_thumbnail_url: string;
            id: string;
            full_title: string;
            url: string;
            title: string;

        };
    };
}
export interface geniusSearchHitsResponse {
    highlights: [];
    result: geniusSearchLyricsInfoResult;
}

export type geniusSearchIndexType = "song";
export type geniusSearchType = "song";
export interface geniusSearchLyricsInfoResult {
    full_title: string;
    id: number;
    song_art_image_thumbnail_url: string;
    title: string;
    title_with_featured: string;
    url: string;

}
