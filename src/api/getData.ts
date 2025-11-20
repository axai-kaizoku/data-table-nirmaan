import mockData from "@/consts/spotify_songs.json";

export type Track = {
  track_id: string;
  track_name: string;
  track_artist: string;
  track_popularity: number;
  track_album_id: string;
  track_album_name: string;
  track_album_release_date: string;
  playlist_name: string;
  playlist_id: string;
  playlist_genre: string;
  playlist_subgenre: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: string;
  acousticness: string;
  instrumentalness: string;
  liveness: string;
  valence: number;
  tempo: number;
  duration_ms: number;
};

export const getData = async ({
  pageIndex = 0,
  pageSize = 10,
  sorting,
}: {
  pageIndex?: number;
  pageSize?: number;
  sorting?: { id: keyof Track; desc: boolean }[];
}): Promise<{ data: Track[]; pageCount: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const start = pageIndex * pageSize;
  const end = start + pageSize;

  const data = (mockData as Track[]).slice(start, end);
  if (sorting) {
    data.sort((a, b) => {
      for (const sort of sorting) {
        if (a[sort.id] < b[sort.id]) {
          return sort.desc ? 1 : -1;
        }
        if (a[sort.id] > b[sort.id]) {
          return sort.desc ? -1 : 1;
        }
      }
      return 0;
    });
  }
  const pageCount = Math.ceil((mockData as Track[]).length / pageSize);

  return { data, pageCount };
};
