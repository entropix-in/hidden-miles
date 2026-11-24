import type { DiscountPackageOption } from "@/components/admin/admin-discount-form";
import type { AdminTour } from "@/lib/types";

export function discountPackageOptions(tours: AdminTour[]): DiscountPackageOption[] {
  return tours
    .map((tour) => ({ id: tour._id, title: tour.title, destinationName: tour.destinationName, image: tour.image, price: tour.price }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
