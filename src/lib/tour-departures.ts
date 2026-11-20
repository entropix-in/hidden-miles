import type { TourDeparture } from "@/lib/types";

const fallbackSeats = [6, 18, 3, 12, 0, 9];

/**
 * Sample departures used when a tour has no dates saved yet. The booking flow
 * and the tour page share these so both show the same dates.
 */
export function fallbackDepartures(
  price: number,
  tourSlug = "",
  count = 18,
): TourDeparture[] {
  return Array.from({ length: count }).map((_, index) => {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 10 + index * 3);
    const seats = fallbackSeats[index % fallbackSeats.length] ?? 10;
    return {
      _id: `fallback-${index}`,
      tourSlug,
      startDate: start.toISOString().slice(0, 10),
      price,
      capacity: 26,
      booked: 26 - seats,
      seatsLeft: seats,
      note: undefined,
      createdAt: 0,
    } satisfies TourDeparture;
  });
}
