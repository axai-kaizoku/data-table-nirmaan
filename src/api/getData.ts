import data from "@/consts/spotify_songs.json";

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

export const getData = async (): Promise<Track[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  return data?.slice(0, 20) as Track[];
};
