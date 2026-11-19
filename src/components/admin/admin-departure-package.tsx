import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";
import type { AdminTour } from "@/lib/types";
import { formatINR, imageUrl } from "@/lib/utils";

export type DeparturePackage = Pick<AdminTour, "_id" | "slug" | "title" | "image" | "price" | "destinationName" | "region" | "days" | "nights">;

export function departurePackage({ _id, slug, title, image, price, destinationName, region, days, nights }: AdminTour): DeparturePackage {
  return { _id, slug, title, image, price, destinationName, region, days, nights };
}

export function AdminDeparturePackage({ tour, details = false, showPrice = false }: { tour: DeparturePackage; details?: boolean; showPrice?: boolean }) {
  return (
    <Link className="admin-departure-package-link" data-details={details || undefined} href={`/admin/tours/${tour._id}`}>
      <span className="admin-departure-thumbnail">
        {tour.image ? <Image src={imageUrl(tour.image, 160)} alt="" fill sizes="64px" className="object-cover" />
          : <Package size={18} aria-hidden />}
      </span>
      <span className="min-w-0">
        <span className="admin-departure-package-title">{tour.title}<ArrowUpRight size={13} aria-hidden /></span>
        <span className="admin-departure-meta">{tour.region}{details && ` · ${tour.nights} nights / ${tour.days} days`}{showPrice && ` · From ${formatINR(tour.price)}`}</span>
      </span>
    </Link>
  );
}
