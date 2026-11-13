import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/site/booking-flow";
import { loadDepartures, loadTour } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await loadTour(slug);
  return {
    title: tour ? `Book ${tour.title}` : "Book a tour",
    robots: { index: false, follow: false },
  };
}

export default async function BookTourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = await loadTour(slug);
  if (!tour) notFound();

  const departures = await loadDepartures(tour.slug);

  return (
    <BookingFlow
      tour={{
        slug: tour.slug,
        title: tour.title,
        image: tour.image,
        price: tour.price,
        oldPrice: tour.oldPrice,
        nights: tour.nights,
        days: tour.days,
        rating: tour.rating,
        reviews: tour.reviews,
        destinationName: tour.destinationName,
      }}
      departures={departures}
    />
  );
}
