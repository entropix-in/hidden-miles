import type { BookingStatus } from "./types";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled",
};
