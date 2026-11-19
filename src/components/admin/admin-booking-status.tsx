import { updateBookingStatusAction } from "@/app/admin/actions";
import { bookingStatusLabels } from "@/lib/booking-status";
import type { BookingStatus } from "@/lib/types";
import { AdminRequestStatus } from "./admin-request-status";

export function AdminBookingStatus(props: { id: string; name: string; status: BookingStatus; returnTo: string }) {
  return <AdminRequestStatus {...props} labels={bookingStatusLabels} action={updateBookingStatusAction} fieldLabel="Booking status" />;
}
