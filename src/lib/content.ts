import { cache } from "react";
import { asc, desc, eq } from "drizzle-orm";
import { dbErrorMessage, getDb, type AppDb } from "@/db";
import {
  destinations as destinationsTable,
  enquiries as enquiriesTable,
  experiences as experiencesTable,
  settings,
  testimonials as testimonialsTable,
  tours as toursTable,
  type DestinationRow,
  type EnquiryRow,
  type ExperienceRow,
  type TestimonialRow,
  type TourRow,
} from "@/db/schema";
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
import type { Tour } from "@/data/tours";

export type AdminResult<T> = {
  data: T[];
  status: ContentStatus;
};

function mapTour(row: TourRow): AdminTour {
  return {
    _id: String(row.id),
    _creationTime: row.createdAt.getTime(),
    slug: row.slug,
    title: row.title,
    destinationSlug: row.destinationSlug,
    destinationName: row.destinationName,
    region: row.region,
    experiences: row.experiences,
    image: row.image,
    nights: Number(row.nights),
    days: Number(row.days),
    price: Number(row.price),
    oldPrice: row.oldPrice === null ? undefined : Number(row.oldPrice),
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    badge: row.badge ?? undefined,
    departure: row.departure,
    groupSize: row.groupSize,
    summary: row.summary,
    highlights: row.highlights,
    inclusions: row.inclusions,
    exclusions: row.exclusions,
    itinerary: row.itinerary,
    featured: Boolean(row.featured),
  };
}

function mapDestination(row: DestinationRow): AdminDestination {
  return {
    _id: String(row.id),
    _creationTime: row.createdAt.getTime(),
    slug: row.slug,
    name: row.name,
    region: row.region,
    tagline: row.tagline,
    description: row.description,
    image: row.image,
    bestTime: row.bestTime,
    highlights: row.highlights,
  };
}

function mapExperience(row: ExperienceRow): AdminExperience {
  return {
    _id: String(row.id),
    _creationTime: row.createdAt.getTime(),
    slug: row.slug,
    title: row.title,
    shortTitle: row.shortTitle,
    description: row.description,
    image: row.image,
    icon: row.icon as Experience["icon"],
    highlights: row.highlights,
  };
}

function mapTestimonial(row: TestimonialRow): AdminTestimonial {
  return {
    _id: String(row.id),
    _creationTime: row.createdAt.getTime(),
    name: row.name,
    city: row.city,
    tour: row.tour,
    rating: Number(row.rating),
    quote: row.quote,
    createdAt: row.createdAt.getTime(),
  };
}

function mapEnquiry(row: EnquiryRow): AdminEnquiry {
  const status = row.status as EnquiryStatus;

  return {
    _id: String(row.id),
    _creationTime: row.createdAt.getTime(),
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone,
    destination: row.destination ?? undefined,
    travellers: row.travellers ?? undefined,
    travelMonth: row.travelMonth ?? undefined,
    message: row.message ?? undefined,
    tour: row.tour ?? undefined,
    source: row.source ?? undefined,
    status,
    createdAt: row.createdAt.getTime(),
  };
}

export const getContentStatus = cache(async (): Promise<ContentStatus> => {
  const db = getDb();
  if (!db) return { configured: false, seeded: false };

  try {
    const rows = await db
      .select({ seeded: settings.seeded })
      .from(settings)
      .where(eq(settings.settingKey, "content"))
      .limit(1);
    return { configured: true, seeded: Boolean(rows[0]?.seeded) };
  } catch (error) {
    return { configured: true, seeded: false, error: dbErrorMessage(error) };
  }
});

export async function loadTours(): Promise<Tour[]> {
  const status = await getContentStatus();
  if (!status.configured || !status.seeded) return staticTours;

  const db = getDb();
  if (!db) return staticTours;

  try {
    const rows = await db
      .select()
      .from(toursTable)
      .orderBy(
        desc(toursTable.featured),
        desc(toursTable.rating),
        asc(toursTable.id),
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

  const db = getDb();
  if (!db) return staticDestinations;

  try {
    const rows = await db
      .select()
      .from(destinationsTable)
      .orderBy(asc(destinationsTable.id));
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

  const db = getDb();
  if (!db) return staticExperiences;

  try {
    const rows = await db
      .select()
      .from(experiencesTable)
      .orderBy(asc(experiencesTable.id));
    return rows.map(mapExperience);
  } catch {
    return staticExperiences;
  }
}

export async function loadTestimonials(): Promise<Testimonial[]> {
  const status = await getContentStatus();
  if (!status.configured || !status.seeded) return staticTestimonials;

  const db = getDb();
  if (!db) return staticTestimonials;

  try {
    const rows = await db
      .select()
      .from(testimonialsTable)
      .orderBy(asc(testimonialsTable.id));
    return rows.map(mapTestimonial);
  } catch {
    return staticTestimonials;
  }
}

async function adminResult<Row, T>(
  load: (db: AppDb) => Promise<Row[]>,
  mapper: (row: Row) => T,
): Promise<AdminResult<T>> {
  const status = await getContentStatus();
  if (!status.configured) return { data: [], status };

  const db = getDb();
  if (!db) return { data: [], status };

  try {
    const rows = await load(db);
    return { data: rows.map(mapper), status };
  } catch (error) {
    return {
      data: [],
      status: { ...status, error: dbErrorMessage(error) },
    };
  }
}

export async function loadAdminTours(): Promise<AdminResult<AdminTour>> {
  return adminResult(
    (db) => db.select().from(toursTable).orderBy(asc(toursTable.id)),
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
  return adminResult(
    (db) =>
      db.select().from(destinationsTable).orderBy(asc(destinationsTable.id)),
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
  return adminResult(
    (db) =>
      db.select().from(experiencesTable).orderBy(asc(experiencesTable.id)),
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
  return adminResult(
    (db) =>
      db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.id)),
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
  return adminResult(
    (db) =>
      db
        .select()
        .from(enquiriesTable)
        .orderBy(desc(enquiriesTable.createdAt))
        .limit(200),
    mapEnquiry,
  );
}
