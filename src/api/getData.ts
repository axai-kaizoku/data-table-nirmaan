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

export type FilterValue = string | number | string[] | number[] | [number, number];

export type Filter = Record<string, FilterValue>;

function toTimestampMs(raw: unknown): number {
  if (raw === null || raw === undefined) return NaN;

  if (typeof raw === "number") {
    return raw < 1e12 ? raw * 1000 : raw;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      return n < 1e12 ? n * 1000 : n;
    }
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
}

export const getData = async ({
  pageIndex = 0,
  pageSize = 10,
  sorting,
  filters,
  searchTerm,
}: {
  pageIndex?: number;
  pageSize?: number;
  sorting?: { id: keyof Track; desc: boolean }[];
  filters?: Filter;
  searchTerm?: string;
}): Promise<{ data: Track[]; pageCount: number; totalCount: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const randomNum = Math.random() * 10;

  if (randomNum < 5) {
    throw new Error("Server is busy");
  }

  // console.log("API Request:", { pageIndex, pageSize, sorting, filters, searchTerm });

  let processedData = [...(mockData as Track[])];

  if (searchTerm && searchTerm.trim() !== "") {
    const term = searchTerm.toLowerCase();
    const keys: (keyof Track)[] = ["track_name", "track_artist", "track_album_name"];

    processedData = processedData.filter((row) =>
      keys.some((key) => {
        const value = row[key];
        return typeof value === "string" && value.toLowerCase().startsWith(term);
      })
    );
  }

  if (filters && Object.keys(filters).length) {
    processedData = processedData.filter((row) => {
      return Object.entries(filters).every(([key, filterValue]) => {
        // Skip null, undefined, empty string, or empty array
        if (
          filterValue === null ||
          filterValue === undefined ||
          (Array.isArray(filterValue) && filterValue.length === 0)
        ) {
          return true;
        }

        const cellValue = row[key as keyof Track];

        // -----------------------
        // 1) Multi-select or Range
        // -----------------------
        if (Array.isArray(filterValue)) {
          if (Array.isArray(filterValue) && filterValue.length === 2) {
            // Accept [number|null, number|null] OR [number, number]
            const rawMin = filterValue[0];
            const rawMax = filterValue[1];

            const hasMin = typeof rawMin === "number";
            const hasMax = typeof rawMax === "number";

            // SPECIAL CASE: duration_ms is in minutes in the UI -> convert cell ms -> minutes
            if (key === "duration_ms") {
              const minutes = Number(cellValue) / 60000; // ms -> minutes

              const minMin = hasMin ? (rawMin as number) : -Infinity;
              const maxMin = hasMax ? (rawMax as number) : Infinity;

              return minutes >= minMin && minutes <= maxMin;
            }

            // For dates/numeric ranges: normalize filter bounds to ms if provided
            const minTs = hasMin ? toTimestampMs(rawMin) : -Infinity;
            const maxTs = hasMax ? toTimestampMs(rawMax) : Infinity;

            // If both bounds were provided but are unparsable, treat as "no-op" (skip filter)
            if (hasMin && !Number.isFinite(minTs) && hasMax && !Number.isFinite(maxTs)) {
              return true;
            }

            const numericCell = toTimestampMs(cellValue);

            // If cell can't be parsed as a timestamp/number, it's not a match
            if (!Number.isFinite(numericCell)) {
              return false;
            }

            return numericCell >= minTs && numericCell <= maxTs;
          }

          // MULTI-SELECT
          return filterValue.map(String).includes(String(cellValue));
        }

        // -----------------------
        // 2) String contains match
        // -----------------------
        if (typeof filterValue === "string") {
          return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
        }

        // -----------------------
        // 3) Exact match for numbers
        // -----------------------
        if (typeof filterValue === "number") {
          return Number(cellValue) === filterValue;
        }

        return true;
      });
    });
  }

  if (sorting && sorting.length > 0) {
    processedData.sort((a, b) => {
      for (const sort of sorting) {
        const aValue = a[sort.id];
        const bValue = b[sort.id];

        if (aValue < bValue) {
          return sort.desc ? 1 : -1;
        }
        if (aValue > bValue) {
          return sort.desc ? -1 : 1;
        }
      }
      return 0;
    });
  }

  const totalCount = processedData.length;
  const pageCount = Math.ceil(totalCount / pageSize);

  // Apply pagination
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const data = processedData.slice(start, end);

  // console.log("API Response:", { totalCount, pageCount, dataLength: data.length });

  return { data, pageCount, totalCount };
};

export const extractGenres = () => {
  const cache = new Set<string>();
  mockData.filter((d) => {
    cache.add(d.playlist_genre);
  });

  console.log({ cache });
  return cache;
};
