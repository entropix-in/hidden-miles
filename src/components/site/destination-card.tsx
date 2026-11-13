import Image from "next/image";
import Link from "next/link";
import { coordsFor } from "@/data/coordinates";
import type { Destination } from "@/data/destinations";
import { cn, imageUrl } from "@/lib/utils";

export function DestinationCard({
  destination,
  tourCount,
  big = false,
  priority = false,
  className,
}: {
  destination: Destination;
  tourCount: number;
  big?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative isolate flex min-h-[308px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink p-7 text-paper",
        big && "min-h-[420px] lg:min-h-[640px]",
        className,
      )}
    >
      <Image
        src={imageUrl(destination.image, big ? 1400 : 900)}
        alt={destination.name}
        fill
        priority={priority}
        sizes={big ? "(max-width: 768px) 100vw, 588px" : "(max-width: 768px) 100vw, 33vw"}
        className="object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/10 to-ink/25" />

      <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3">
        <span className="coord rounded-full bg-ink/45 px-3 py-1.5 text-paper backdrop-blur">
          {coordsFor(destination.slug)}
        </span>
        <span className="badge badge-glass">
          {tourCount} {tourCount === 1 ? "tour" : "tours"}
        </span>
      </div>

      <div className="relative max-w-[calc(100%-64px)]">
        <h3 className={cn(big ? "type-h2" : "type-h3", "text-paper")}>
          {destination.name}
        </h3>
        <p className="type-small mt-2 text-navy-200">{destination.tagline}</p>
      </div>

      <span className="absolute bottom-6 right-6 grid h-[52px] w-[52px] place-items-center rounded-full bg-gold-400 text-ink transition duration-300 group-hover:scale-105 group-hover:bg-gold-300">
        <span className="text-xl leading-none">↗</span>
      </span>
    </Link>
  );
}
