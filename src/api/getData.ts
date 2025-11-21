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

// helper to normalise a value to epoch milliseconds (or NaN if not a date/number)
function toTimestampMs(raw: unknown): number {
  if (raw === null || raw === undefined) return NaN;

  if (typeof raw === "number") {
    // if number looks like seconds (e.g. < 1e12), convert to ms
    return raw < 1e12 ? raw * 1000 : raw;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();

    // pure-digits string -> treat as epoch (seconds or ms)
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      return n < 1e12 ? n * 1000 : n;
    }

    // Try Date.parse (supports ISO date strings)
    const parsed = Date.parse(trimmed); // returns ms or NaN
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

  console.log("API Request:", { pageIndex, pageSize, sorting, filters, searchTerm });

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
          const isRange =
            filterValue.length === 2 && typeof filterValue[0] === "number" && typeof filterValue[1] === "number";

          if (isRange) {
            const minRaw = filterValue[0] as number;
            const maxRaw = filterValue[1] as number;

            const min = toTimestampMs(minRaw);
            const max = toTimestampMs(maxRaw);

            if (key === "duration_ms") {
              const minutes = Number(cellValue) / 60000; // ms → minutes
              return minutes >= minRaw && minutes <= maxRaw;
            }

            // if filter bounds are invalid, skip this filter (or you could return true/false)
            if (!Number.isFinite(min) || !Number.isFinite(max)) return true;

            const numericCell = toTimestampMs(cellValue);

            if (!Number.isFinite(numericCell)) {
              // cell is not a parseable date/number -> treat as not-matching
              return false;
            }

            return numericCell >= min && numericCell <= max;
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

  console.log("API Response:", { totalCount, pageCount, dataLength: data.length });

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
