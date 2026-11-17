export type TourCity = {
  name: string;
  note: string;
  /** Added to the per-person departure price. Use a negative value for land-only options. */
  priceDelta: number;
};

export const defaultTourCities: TourCity[] = [
  { name: "Mumbai", note: "Flight included", priceDelta: 0 },
  { name: "Delhi", note: "Flight included", priceDelta: -2400 },
  { name: "Bengaluru", note: "Flight included", priceDelta: 3800 },
  { name: "Pune", note: "Flight via Mumbai", priceDelta: 1900 },
  {
    name: "Join at destination",
    note: "Tour only · book your own flights",
    priceDelta: -9500,
  },
];

/**
 * Legacy rows have no saved city list, so they fall back to the standard set.
 * Tours saved from the admin panel always carry at least one city.
 */
export function resolveTourCities(
  cities?: TourCity[] | null,
): TourCity[] {
  return cities?.length ? cities : defaultTourCities;
}

/**
 * Parses the JSON payload posted by the admin departure-cities editor.
 * Invalid rows are dropped, names are de-duplicated, and values are clamped.
 */
export function parseTourCities(raw: string): TourCity[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const cities: TourCity[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const candidate = item as {
        name?: unknown;
        note?: unknown;
        priceDelta?: unknown;
      };
      const name =
        typeof candidate.name === "string"
          ? candidate.name.trim().slice(0, 120)
          : "";

      if (!name) continue;
      if (
        cities.some(
          (city) => city.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        continue;
      }

      const note =
        typeof candidate.note === "string"
          ? candidate.note.trim().slice(0, 190)
          : "";
      const delta = Math.round(Number(candidate.priceDelta) || 0);

      cities.push({
        name,
        note,
        priceDelta: Math.min(100000, Math.max(-100000, delta)),
      });

      if (cities.length === 12) break;
    }

    return cities;
  } catch {
    return [];
  }
}
