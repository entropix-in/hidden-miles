import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/site/booking-flow";
import { loadDepartures, loadTour } from "@/lib/content";
import { resolveTourCities } from "@/lib/tour-cities";
import { requireUser } from "@/lib/user-auth";

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const tour = await loadTour(slug);
  if (!tour) notFound();

  const nextParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") nextParams.set(key, value);
    else if (Array.isArray(value)) value.forEach((item) => nextParams.append(key, item));
  }
  const nextPath = `/tours/${slug}/book${nextParams.size ? `?${nextParams}` : ""}`;
  const user = await requireUser(nextPath);

  const departures = await loadDepartures(tour.slug);

  const readParam = (key: string) => {
    const value = query[key];
    return typeof value === "string" ? value : undefined;
  };
  const readNumber = (key: string) => {
    const value = readParam(key);
    if (!value) return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  };

  return (
    <BookingFlow
      tour={{
        slug: tour.slug,
        title: tour.title,
        image: tour.image,
        price: tour.price,
        childPrice: tour.childPrice,
        infantPrice: tour.infantPrice,
        oldPrice: tour.oldPrice,
        nights: tour.nights,
        days: tour.days,
        rating: tour.rating,
        reviews: tour.reviews,
        destinationName: tour.destinationName,
      }}
      departures={departures}
      cities={resolveTourCities(tour.departureCities)}
      initialDate={readParam("date")}
      initialCity={readParam("city")}
      initialAdults={readNumber("adults")}
      initialChildren={readNumber("children")}
      initialInfants={readNumber("infants")}
      account={{
        name: user.name,
        email: user.email,
        phone: user.phone,
      }}
    />
  );
}
