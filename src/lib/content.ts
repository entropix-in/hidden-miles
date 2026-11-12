import { cache } from "react";
import { and, asc, desc, eq, gte, ne, sum } from "drizzle-orm";
import { dbErrorMessage, getDb, type AppDb } from "@/db";
import {
  bookings as bookingsTable,
  destinations as destinationsTable,
  enquiries as enquiriesTable,
  experiences as experiencesTable,
  settings,
  testimonials as testimonialsTable,
  tourDepartures as tourDeparturesTable,
  tours as toursTable,
  type BookingRow,
  type DepartureRow,
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
  TourBooking,
  TourDeparture,
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

async function bookedSeatsByDeparture(db: AppDb) {
  const rows = await db
    .select({
      departureId: bookingsTable.departureId,
      travellers: sum(bookingsTable.travellers),
    })
    .from(bookingsTable)
    .where(ne(bookingsTable.status, "cancelled"))
    .groupBy(bookingsTable.departureId);

  const booked = new Map<number, number>();
  for (const row of rows) {
    if (row.departureId === null) continue;
    booked.set(Number(row.departureId), Number(row.travellers ?? 0));
  }
  return booked;
}

function mapDeparture(row: DepartureRow, booked: number): TourDeparture {
  const capacity = Number(row.capacity);
  return {
    _id: String(row.id),
    tourSlug: row.tourSlug,
    startDate: String(row.startDate),
    price: Number(row.price),
    capacity,
    booked,
    seatsLeft: Math.max(0, capacity - booked),
    note: row.note ?? undefined,
    createdAt: row.createdAt.getTime(),
  };
}

export async function loadDepartures(
  tourSlug: string,
): Promise<TourDeparture[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const today = new Date().toISOString().slice(0, 10);
    const [rows, booked] = await Promise.all([
      db
        .select()
        .from(tourDeparturesTable)
        .where(
          and(
            eq(tourDeparturesTable.tourSlug, tourSlug),
            gte(tourDeparturesTable.startDate, today),
          ),
        )
        .orderBy(asc(tourDeparturesTable.startDate)),
      bookedSeatsByDeparture(db),
    ]);

    return rows.map((row) =>
      mapDeparture(row, booked.get(Number(row.id)) ?? 0),
    );
  } catch {
    return [];
  }
}

export async function loadAdminDepartures(
  tourSlug?: string,
): Promise<AdminResult<TourDeparture>> {
  const status = await getContentStatus();
  if (!status.configured) return { data: [], status };

  const db = getDb();
  if (!db) return { data: [], status };

  try {
    const [rows, booked] = await Promise.all([
      tourSlug
        ? db
            .select()
            .from(tourDeparturesTable)
            .where(eq(tourDeparturesTable.tourSlug, tourSlug))
            .orderBy(asc(tourDeparturesTable.startDate))
        : db
            .select()
            .from(tourDeparturesTable)
            .orderBy(asc(tourDeparturesTable.startDate)),
      bookedSeatsByDeparture(db),
    ]);

    return {
      data: rows.map((row) =>
        mapDeparture(row, booked.get(Number(row.id)) ?? 0),
      ),
      status,
    };
  } catch (error) {
    return {
      data: [],
      status: { ...status, error: dbErrorMessage(error) },
    };
  }
}

function mapBooking(row: BookingRow): TourBooking {
  return {
    _id: String(row.id),
    departureId: row.departureId === null ? undefined : String(row.departureId),
    tourSlug: row.tourSlug,
    tourTitle: row.tourTitle,
    startDate: row.startDate ? String(row.startDate) : undefined,
    name: row.name,
    email: row.email,
    phone: row.phone,
    travellers: Number(row.travellers),
    amount: Number(row.amount),
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.createdAt.getTime(),
  };
}

export async function loadAdminBookings(
  tourSlug?: string,
): Promise<AdminResult<TourBooking>> {
  const status = await getContentStatus();
  if (!status.configured) return { data: [], status };

  const db = getDb();
  if (!db) return { data: [], status };

  try {
    const rows = tourSlug
      ? await db
          .select()
          .from(bookingsTable)
          .where(eq(bookingsTable.tourSlug, tourSlug))
          .orderBy(desc(bookingsTable.createdAt))
      : await db
          .select()
          .from(bookingsTable)
          .orderBy(desc(bookingsTable.createdAt));

    return { data: rows.map(mapBooking), status };
  } catch (error) {
    return {
      data: [],
      status: { ...status, error: dbErrorMessage(error) },
    };
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
