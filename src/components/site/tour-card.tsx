import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Rating } from "@/components/site/rating";
import { coordsFor } from "@/data/coordinates";
import type { Tour } from "@/data/tours";
import { cn, formatINR, imageUrl } from "@/lib/utils";

function badgeClass(badge?: string) {
  const value = badge?.toLowerCase() ?? "";
  if (value.includes("filling")) return "badge-danger";
  return "badge-gold";
}

export function TourCard({
  tour,
  priority = false,
  className,
  compact = false,
}: {
  tour: Tour;
  priority?: boolean;
  className?: string;
  compact?: boolean;
}) {
  return <TourCardContent tour={tour} priority={priority} className={className} compact={compact} />;
}

function TourCardContent({
  tour,
  priority,
  className,
  compact,
}: {
  tour: Tour;
  priority: boolean;
  className?: string;
  compact: boolean;
}) {
  const route = `${tour.destinationName} · ${tour.region}`;
  const seatsLow = /left|filling|sold/i.test(tour.departure);

  return (
    <article
      className={cn(
        "card-lift group flex h-full flex-col rounded-[28px] border border-sand-300 bg-paper p-2 shadow-[0_12px_32px_-24px_rgba(11,39,53,0.4)]",
        className,
      )}
    >
      <Link
        href={`/tours/${tour.slug}`}
        aria-label={`View ${tour.title}`}
        className={cn(
          "relative block overflow-hidden rounded-[20px] bg-ink",
          compact ? "aspect-[4/3]" : "aspect-[376/240]",
        )}
      >
        <Image
          src={imageUrl(tour.image, 1000)}
          alt={tour.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-ink/20" />

        {tour.badge ? (
          <span className={cn("badge absolute left-4 top-4", badgeClass(tour.badge))}>
            {tour.badge}
          </span>
        ) : null}

        <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink backdrop-blur transition hover:bg-white">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Save {tour.title}</span>
        </span>

        <span className="coord coord-dark absolute bottom-4 left-4">
          {coordsFor(tour.destinationSlug)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-5">
        <div className="flex flex-wrap items-center gap-3 text-[13px] font-bold text-navy-500">
          <span>
            {tour.days}D / {tour.nights}N
          </span>
          <span className="text-sand-300">·</span>
          <Rating score={tour.rating.toFixed(1)} count={tour.reviews} />
        </div>

        <div>
          <h3 className="type-h4 text-ink">
            <Link
              href={`/tours/${tour.slug}`}
              className="transition hover:text-navy-700"
            >
              {tour.title}
            </Link>
          </h3>
          <p className="type-small mt-1.5 text-navy-500">{route}</p>
        </div>

        <p className="inline-flex w-fit items-center gap-2 rounded-[10px] bg-sand-100 px-3 py-2 text-[13px] font-medium text-navy-700">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              seatsLow ? "bg-danger" : "bg-success",
            )}
          />
          Next: {tour.departure}
        </p>

        <div className="route-line mt-auto" />

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-navy-400">
              {tour.oldPrice ? `From · was ${formatINR(tour.oldPrice)}` : "From"}
            </p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="type-price text-ink">{formatINR(tour.price)}</span>
              <span className="text-[13px] font-medium text-navy-400">
                / person
              </span>
            </p>
          </div>
          <Link
            href={`/tours/${tour.slug}#book`}
            className="btn btn-ink btn-sm"
            aria-label={`Book ${tour.title}`}
          >
            View
            <span className="btn-dot">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TourListCard({
  tour,
  priority = false,
}: {
  tour: Tour;
  priority?: boolean;
}) {
  const route = `${tour.destinationName} · ${tour.region}`;
  const seatsLow = /left|filling|sold/i.test(tour.departure);

  return (
    <article className="card-lift group flex flex-col overflow-hidden rounded-[28px] border border-sand-300 bg-paper p-2 sm:flex-row">
      <Link
        href={`/tours/${tour.slug}`}
        aria-label={`View ${tour.title}`}
        className="relative block aspect-[280/200] w-full shrink-0 overflow-hidden rounded-[20px] bg-ink sm:w-[280px]"
      >
        <Image
          src={imageUrl(tour.image, 800)}
          alt={tour.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, 280px"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/10" />
        {tour.badge ? (
          <span className={cn("badge absolute left-4 top-4", badgeClass(tour.badge))}>
            {tour.badge}
          </span>
        ) : null}
        <span className="coord coord-dark absolute bottom-4 left-4">
          {coordsFor(tour.destinationSlug)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-3 text-[13px] font-bold text-navy-500">
          <span>
            {tour.days}D / {tour.nights}N
          </span>
          <span className="text-sand-300">·</span>
          <Rating score={tour.rating.toFixed(1)} count={tour.reviews} />
        </div>
        <div>
          <h3 className="type-h4 text-ink">
            <Link href={`/tours/${tour.slug}`} className="transition hover:text-navy-700">
              {tour.title}
            </Link>
          </h3>
          <p className="type-small mt-1 text-navy-500">{route}</p>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-[10px] bg-sand-100 px-3 py-2 text-[13px] font-medium text-navy-700">
          <span
            className={cn("h-2 w-2 rounded-full", seatsLow ? "bg-danger" : "bg-success")}
          />
          Next: {tour.departure}
        </p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-sand-300 pt-3">
          <div>
            <p className="text-[13px] font-medium text-navy-400">
              {tour.oldPrice ? `From · was ${formatINR(tour.oldPrice)}` : "From"}
            </p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="type-price text-ink">{formatINR(tour.price)}</span>
              <span className="text-[13px] font-medium text-navy-400">/ person</span>
            </p>
          </div>
          <Link
            href={`/tours/${tour.slug}#book`}
            className="btn btn-ink btn-sm"
            aria-label={`Book ${tour.title}`}
          >
            View
            <span className="btn-dot">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
