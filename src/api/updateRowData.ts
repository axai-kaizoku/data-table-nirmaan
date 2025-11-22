import mockData from "@/consts/spotify_songs.json";
import type { Track } from "./getData";

export const updateRowData = ({ id, body }: { id: string; body: Track }) => {
  const processedData: Track[] = JSON.parse(JSON.stringify(mockData));

  let index = 0;
  const filtered = processedData.filter((t, i) => {
    index = i;
    return t.track_id === id;
  });

  const modified = { ...filtered, ...body };

  processedData[index] = modified;

  return modified;
};
