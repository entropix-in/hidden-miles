import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { cn, imageUrl } from "@/lib/utils";

export function DestinationCard({
  destination,
  tourCount,
  className,
  priority = false,
}: {
  destination: Destination;
  tourCount: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[28px] p-6 text-cream-50 shadow-lg shadow-forest-950/10",
        className,
      )}
    >
      <Image
        src={imageUrl(destination.image, 900)}
        alt={destination.name}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/20 to-transparent" />

      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
        <MapPin className="h-3 w-3 text-saffron-300" />
        {destination.region}
      </span>

      <div className="relative">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-saffron-300">
          {tourCount} {tourCount === 1 ? "journey" : "journeys"}
        </p>
        <h3 className="mt-1.5 font-display text-[26px] font-semibold leading-tight">
          {destination.name}
        </h3>
        <p className="mt-1 max-w-[85%] text-[13px] leading-5 text-cream-100/75">
          {destination.tagline}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-white">
          Explore
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition duration-300 group-hover:bg-saffron-500">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </span>
      </div>
    </Link>
  );
}
