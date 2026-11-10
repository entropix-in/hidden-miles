import { cache } from "react";
import type { RowDataPacket } from "mysql2";
import { dbErrorMessage, dbQuery, isDbConfigured } from "@/lib/db";
import type {
  AdminDestination,
  AdminEnquiry,
  AdminExperience,
  AdminTestimonial,
  AdminTour,
  ContentStatus,
  EnquiryStatus,
} from "@/lib/types";
import { destinations as staticDestinations } from "@/data/destinations";
import type { Destination } from "@/data/destinations";
import { experiences as staticExperiences } from "@/data/experiences";
import type { Experience } from "@/data/experiences";
import { testimonials as staticTestimonials } from "@/data/site";
import type { Testimonial } from "@/data/site";
import { tours as staticTours } from "@/data/tours";
import type { ItineraryDay, Tour } from "@/data/tours";

export type AdminResult<T> = {
  data: T[];
  status: ContentStatus;
};

type SettingRow = RowDataPacket & {
  seeded: number;
};

type TourRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  destination_slug: string;
  destination_name: string;
  region: string;
  experiences: string | string[];
  image: string;
  nights: number;
  days: number;
  price: number;
  old_price: number | null;
  rating: string | number;
  reviews: number;
  badge: string | null;
  departure: string;
  group_size: string;
  summary: string;
  highlights: string | string[];
  inclusions: string | string[];
  exclusions: string | string[];
  itinerary: string | ItineraryDay[];
  featured: number;
  created_at: Date | string;
};

type DestinationRow = RowDataPacket & {
  id: number;
  slug: string;
  name: string;
  region: string;
  tagline: string;
  description: string;
  image: string;
  best_time: string;
  highlights: string | string[];
  created_at: Date | string;
};

type ExperienceRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  short_title: string;
  description: string;
  image: string;
  icon: string;
  highlights: string | string[];
  created_at: Date | string;
};

type TestimonialRow = RowDataPacket & {
  id: number;
  name: string;
  city: string;
  tour: string;
  rating: number;
  quote: string;
  created_at: Date | string;
};

type EnquiryRow = RowDataPacket & {
  id: number;
  type: string;
  name: string;
  email: string;
  phone: string;
  destination: string | null;
  travellers: string | null;
  travel_month: string | null;
  message: string | null;
  tour: string | null;
  source: string | null;
  status: string | null;
  created_at: Date | string;
};

function parseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function createdTime(value: Date | string) {
  return new Date(value).getTime();
}

function mapTour(row: TourRow): AdminTour {
  return {
    _id: String(row.id),
    _creationTime: createdTime(row.created_at),
    slug: row.slug,
    title: row.title,
    destinationSlug: row.destination_slug,
    destinationName: row.destination_name,
    region: row.region === "International" ? "International" : "India",
    experiences: parseArray<string>(row.experiences),
    image: row.image,
    nights: Number(row.nights),
    days: Number(row.days),
    price: Number(row.price),
    oldPrice: row.old_price === null ? undefined : Number(row.old_price),
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    badge: row.badge ?? undefined,
    departure: row.departure,
    groupSize: row.group_size,
    summary: row.summary,
    highlights: parseArray<string>(row.highlights),
    inclusions: parseArray<string>(row.inclusions),
    exclusions: parseArray<string>(row.exclusions),
    itinerary: parseArray<ItineraryDay>(row.itinerary),
    featured: Boolean(row.featured),
  };
}

function mapDestination(row: DestinationRow): AdminDestination {
  return {
    _id: String(row.id),
    _creationTime: createdTime(row.created_at),
    slug: row.slug,
    name: row.name,
    region: row.region === "International" ? "International" : "India",
    tagline: row.tagline,
    description: row.description,
    image: row.image,
    bestTime: row.best_time,
    highlights: parseArray<string>(row.highlights),
  };
}

function mapExperience(row: ExperienceRow): AdminExperience {
  return {
    _id: String(row.id),
    _creationTime: createdTime(row.created_at),
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title,
    description: row.description,
    image: row.image,
    icon: row.icon as Experience["icon"],
    highlights: parseArray<string>(row.highlights),
  };
}

function mapTestimonial(row: TestimonialRow): AdminTestimonial {
  return {
    _id: String(row.id),
    _creationTime: createdTime(row.created_at),
    name: row.name,
    city: row.city,
    tour: row.tour,
    rating: Number(row.rating),
    quote: row.quote,
    createdAt: createdTime(row.created_at),
  };
}

function mapEnquiry(row: EnquiryRow): AdminEnquiry {
  const status = (row.status ?? "new") as EnquiryStatus;

  return {
    _id: String(row.id),
    _creationTime: createdTime(row.created_at),
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone,
    destination: row.destination ?? undefined,
    travellers: row.travellers ?? undefined,
    travelMonth: row.travel_month ?? undefined,
    message: row.message ?? undefined,
    tour: row.tour ?? undefined,
    source: row.source ?? undefined,
    status,
    createdAt: createdTime(row.created_at),
  };
}

export const getContentStatus = cache(async (): Promise<ContentStatus> => {
  if (!isDbConfigured()) return { configured: false, seeded: false };

  try {
    const rows = await dbQuery<SettingRow[]>(
      "SELECT seeded FROM settings WHERE setting_key = 'content' LIMIT 1",
    );
    return { configured: true, seeded: Boolean(rows[0]?.seeded) };
  } catch (error) {
    return { configured: true, seeded: false, error: dbErrorMessage(error) };
  }
});

export async function loadTours(): Promise<Tour[]> {
  const status = await getContentStatus();
  if (!status.configured || !status.seeded) return staticTours;

  try {
    const rows = await dbQuery<TourRow[]>(
      "SELECT * FROM tours ORDER BY featured DESC, rating DESC, id ASC",
    );
    return rows.map(mapTour);
  } catch {
    return staticTours;
  }
}

export async function loadTour(slug: string): Promise<Tour | undefined> {
  const tours = await loadTours();
  return tours.find((tour) => tour.slug === slug);
}

export async function loadDestinations(): Promise<Destination[]> {
  const status = await getContentStatus();
  if (!status.configured || !status.seeded) return staticDestinations;

  try {
    const rows = await dbQuery<DestinationRow[]>(
      "SELECT * FROM destinations ORDER BY id ASC",
    );
    return rows.map(mapDestination);
  } catch {
    return staticDestinations;
  }
}

export async function loadDestination(
  slug: string,
): Promise<Destination | undefined> {
  const destinations = await loadDestinations();
  return destinations.find((destination) => destination.slug === slug);
}

export async function loadExperiences(): Promise<Experience[]> {
  const status = await getContentStatus();
  if (!status.configured || !status.seeded) return staticExperiences;

  try {
    const rows = await dbQuery<ExperienceRow[]>(
      "SELECT * FROM experiences ORDER BY id ASC",
    );
    return rows.map(mapExperience);
  } catch {
    return staticExperiences;
  }
}

export async function loadTestimonials(): Promise<Testimonial[]> {
  const status = await getContentStatus();
  if (!status.configured || !status.seeded) return staticTestimonials;

  try {
    const rows = await dbQuery<TestimonialRow[]>(
      "SELECT * FROM testimonials ORDER BY id ASC",
    );
    return rows.map(mapTestimonial);
  } catch {
    return staticTestimonials;
  }
}

async function adminResult<Row extends RowDataPacket, T>(
  query: string,
  mapper: (row: Row) => T,
): Promise<AdminResult<T>> {
  const status = await getContentStatus();
  if (!status.configured) return { data: [], status };

  try {
    const rows = await dbQuery<Row[]>(query);
    return { data: rows.map(mapper), status };
  } catch (error) {
    return {
      data: [],
      status: { ...status, error: dbErrorMessage(error) },
    };
  }
}

export async function loadAdminTours(): Promise<AdminResult<AdminTour>> {
  return adminResult<TourRow, AdminTour>(
    "SELECT * FROM tours ORDER BY id ASC",
    mapTour,
  );
}

export async function loadAdminTour(
  id: string,
): Promise<AdminTour | undefined> {
  const result = await loadAdminTours();
  return result.data.find((tour) => tour._id === id);
}

export async function loadAdminDestinations(): Promise<
  AdminResult<AdminDestination>
> {
  return adminResult<DestinationRow, AdminDestination>(
    "SELECT * FROM destinations ORDER BY id ASC",
    mapDestination,
  );
}

export async function loadAdminDestination(
  id: string,
): Promise<AdminDestination | undefined> {
  const result = await loadAdminDestinations();
  return result.data.find((destination) => destination._id === id);
}

export async function loadAdminExperiences(): Promise<
  AdminResult<AdminExperience>
> {
  return adminResult<ExperienceRow, AdminExperience>(
    "SELECT * FROM experiences ORDER BY id ASC",
    mapExperience,
  );
}

export async function loadAdminExperience(
  id: string,
): Promise<AdminExperience | undefined> {
  const result = await loadAdminExperiences();
  return result.data.find((experience) => experience._id === id);
}

export async function loadAdminTestimonials(): Promise<
  AdminResult<AdminTestimonial>
> {
  return adminResult<TestimonialRow, AdminTestimonial>(
    "SELECT * FROM testimonials ORDER BY id ASC",
    mapTestimonial,
  );
}

export async function loadAdminTestimonial(
  id: string,
): Promise<AdminTestimonial | undefined> {
  const result = await loadAdminTestimonials();
  return result.data.find((testimonial) => testimonial._id === id);
}

export async function loadAdminEnquiries(): Promise<AdminResult<AdminEnquiry>> {
  return adminResult<EnquiryRow, AdminEnquiry>(
    "SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 200",
    mapEnquiry,
  );
}
