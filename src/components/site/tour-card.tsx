import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Star } from "lucide-react";
import type { Tour } from "@/data/tours";
import { formatINR, imageUrl } from "@/lib/utils";

export function TourCard({ tour, priority = false }: { tour: Tour; priority?: boolean }) {
  return (
    <article className="card-lift group flex h-full flex-col overflow-hidden rounded-[28px] border border-stone-200/80 bg-white shadow-[0_10px_40px_-24px_rgba(6,42,38,0.35)]">
      <Link
        href={`/tours/${tour.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={`View ${tour.title}`}
      >
        <Image
          src={imageUrl(tour.image, 900)}
          alt={tour.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-transparent" />
        {tour.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-blue-500 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
            {tour.badge}
          </span>
        ) : null}
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[11px] font-extrabold text-navy-950 shadow-sm backdrop-blur">
          <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
          {tour.rating.toFixed(1)}
          <span className="font-semibold text-stone-500">({tour.reviews})</span>
        </span>
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sand-50 backdrop-blur">
          <CalendarDays className="h-3 w-3" />
          {tour.nights}N / {tour.days}D
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-700">
          <MapPin className="h-3.5 w-3.5" />
          {tour.destinationName} · {tour.region}
        </p>
        <h3 className="mt-2 font-display text-[22px] font-semibold leading-snug text-navy-950">
          <Link href={`/tours/${tour.slug}`} className="transition hover:text-blue-700">
            {tour.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-stone-500">
          {tour.summary}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-stone-200 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Starting from
            </p>
            <p className="mt-0.5 flex items-baseline gap-2">
              <span className="font-display text-xl font-semibold text-navy-950">
                {formatINR(tour.price)}
              </span>
              {tour.oldPrice ? (
                <span className="text-xs font-semibold text-stone-400 line-through">
                  {formatINR(tour.oldPrice)}
                </span>
              ) : null}
            </p>
            <p className="text-[10px] font-semibold text-stone-400">per person</p>
          </div>
          <Link
            href={`/tours/${tour.slug}`}
            aria-label={`Explore ${tour.title}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand-100 text-navy-950 transition duration-300 group-hover:bg-blue-600 group-hover:text-white"
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
