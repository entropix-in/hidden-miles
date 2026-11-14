import { eq } from "drizzle-orm";
import type { AppDb } from "@/db";
import {
  bookings as bookingsTable,
  destinations as destinationsTable,
  enquiries as enquiriesTable,
  experiences as experiencesTable,
  settings,
  testimonials as testimonialsTable,
  tourDepartures as tourDeparturesTable,
  tours as toursTable,
} from "@/db/schema";
import { destinations as staticDestinations } from "@/data/destinations";
import type { Destination } from "@/data/destinations";
import { experiences as staticExperiences } from "@/data/experiences";
import type { Experience } from "@/data/experiences";
import {
  seedBookings,
  seedDepartures,
} from "@/data/seed-bookings";
import { seedEnquiries } from "@/data/seed-enquiries";
import { testimonials as staticTestimonials } from "@/data/site";
import type { Testimonial } from "@/data/site";
import { tours as staticTours } from "@/data/tours";
import type { Tour } from "@/data/tours";

export type SeedCount = {
  added: number;
  updated: number;
  skipped: number;
};

export type SeedSummary = {
  tours: SeedCount;
  destinations: SeedCount;
  experiences: SeedCount;
  testimonials: SeedCount;
};

export type SeedActivitySummary = {
  departures: SeedCount;
  bookings: SeedCount;
  enquiries: SeedCount;
};

type SeedOptions = {
  /** Overwrite existing rows with the values from the codebase. */
  force?: boolean;
};

function emptyCount(): SeedCount {
  return { added: 0, updated: 0, skipped: 0 };
}

export function tourValues(tour: Tour) {
  return {
    slug: tour.slug,
    title: tour.title,
    destinationSlug: tour.destinationSlug,
    destinationName: tour.destinationName,
    region: tour.region,
    experiences: tour.experiences,
    image: tour.image,
    nights: tour.nights,
    days: tour.days,
    price: tour.price,
    oldPrice: tour.oldPrice ?? null,
    rating: String(tour.rating),
    reviews: tour.reviews,
    badge: tour.badge ?? null,
    departure: tour.departure,
    groupSize: tour.groupSize,
    summary: tour.summary,
    highlights: tour.highlights,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    itinerary: tour.itinerary,
    featured: tour.featured ? 1 : 0,
  } satisfies typeof toursTable.$inferInsert;
}

export function destinationValues(destination: Destination) {
  return {
    slug: destination.slug,
    name: destination.name,
    region: destination.region,
    tagline: destination.tagline,
    description: destination.description,
    image: destination.image,
    bestTime: destination.bestTime,
    highlights: destination.highlights,
  } satisfies typeof destinationsTable.$inferInsert;
}

export function experienceValues(experience: Experience) {
  return {
    slug: experience.slug,
    title: experience.title,
    shortTitle: experience.shortTitle,
    description: experience.description,
    image: experience.image,
    icon: experience.icon,
    highlights: experience.highlights,
  } satisfies typeof experiencesTable.$inferInsert;
}

export function testimonialValues(testimonial: Testimonial) {
  return {
    name: testimonial.name,
    city: testimonial.city,
    tour: testimonial.tour,
    rating: testimonial.rating,
    quote: testimonial.quote,
  } satisfies typeof testimonialsTable.$inferInsert;
}

/**
 * Copies the hard-coded starter content into MySQL.
 *
 * By default this only adds rows that do not exist yet, so admin edits are
 * preserved. Pass `{ force: true }` to overwrite the starter rows with the
 * values currently in the codebase.
 */
export async function seedStaticContent(
  db: AppDb,
  { force = false }: SeedOptions = {},
): Promise<SeedSummary> {
  const summary: SeedSummary = {
    tours: emptyCount(),
    destinations: emptyCount(),
    experiences: emptyCount(),
    testimonials: emptyCount(),
  };

  const [existingTours, existingDestinations, existingExperiences, existingTestimonials] =
    await Promise.all([
      db.select({ slug: toursTable.slug }).from(toursTable),
      db.select({ slug: destinationsTable.slug }).from(destinationsTable),
      db.select({ slug: experiencesTable.slug }).from(experiencesTable),
      db.select({ quote: testimonialsTable.quote }).from(testimonialsTable),
    ]);

  const tourSlugs = new Set(existingTours.map((row) => row.slug));
  const destinationSlugs = new Set(existingDestinations.map((row) => row.slug));
  const experienceSlugs = new Set(existingExperiences.map((row) => row.slug));
  const testimonialQuotes = new Set(
    existingTestimonials.map((row) => row.quote),
  );

  for (const tour of staticTours) {
    if (tourSlugs.has(tour.slug)) {
      if (force) {
        await db
          .update(toursTable)
          .set(tourValues(tour))
          .where(eq(toursTable.slug, tour.slug));
        summary.tours.updated += 1;
      } else {
        summary.tours.skipped += 1;
      }
    } else {
      await db.insert(toursTable).values(tourValues(tour));
      summary.tours.added += 1;
    }
  }

  for (const destination of staticDestinations) {
    if (destinationSlugs.has(destination.slug)) {
      if (force) {
        await db
          .update(destinationsTable)
          .set(destinationValues(destination))
          .where(eq(destinationsTable.slug, destination.slug));
        summary.destinations.updated += 1;
      } else {
        summary.destinations.skipped += 1;
      }
    } else {
      await db
        .insert(destinationsTable)
        .values(destinationValues(destination));
      summary.destinations.added += 1;
    }
  }

  for (const experience of staticExperiences) {
    if (experienceSlugs.has(experience.slug)) {
      if (force) {
        await db
          .update(experiencesTable)
          .set(experienceValues(experience))
          .where(eq(experiencesTable.slug, experience.slug));
        summary.experiences.updated += 1;
      } else {
        summary.experiences.skipped += 1;
      }
    } else {
      await db.insert(experiencesTable).values(experienceValues(experience));
      summary.experiences.added += 1;
    }
  }

  for (const testimonial of staticTestimonials) {
    if (testimonialQuotes.has(testimonial.quote)) {
      if (force) {
        await db
          .update(testimonialsTable)
          .set(testimonialValues(testimonial))
          .where(eq(testimonialsTable.quote, testimonial.quote));
        summary.testimonials.updated += 1;
      } else {
        summary.testimonials.skipped += 1;
      }
    } else {
      await db.insert(testimonialsTable).values(testimonialValues(testimonial));
      summary.testimonials.added += 1;
    }
  }

  return summary;
}

/**
 * Seeds sample departures, booking requests and contact enquiries.
 *
 * This is intentionally separate from `seedStaticContent` so a brand-new
 * production database is not filled with demo bookings automatically. Run
 * `pnpm db:seed` (or `pnpm db:seed:force`) to create them.
 */
export async function seedSampleActivity(
  db: AppDb,
  { force = false }: SeedOptions = {},
): Promise<SeedActivitySummary> {
  const summary: SeedActivitySummary = {
    departures: emptyCount(),
    bookings: emptyCount(),
    enquiries: emptyCount(),
  };

  const existingDepartures = await db
    .select({
      id: tourDeparturesTable.id,
      tourSlug: tourDeparturesTable.tourSlug,
      startDate: tourDeparturesTable.startDate,
    })
    .from(tourDeparturesTable);

  for (const departure of seedDepartures) {
    const existing = existingDepartures.find(
      (row) =>
        row.tourSlug === departure.tourSlug &&
        row.startDate === departure.startDate,
    );

    if (existing) {
      if (force) {
        await db
          .update(tourDeparturesTable)
          .set({
            price: departure.price,
            capacity: departure.capacity,
            note: departure.note ?? null,
          })
          .where(eq(tourDeparturesTable.id, existing.id));
        summary.departures.updated += 1;
      } else {
        summary.departures.skipped += 1;
      }
      continue;
    }

    await db.insert(tourDeparturesTable).values({
      tourSlug: departure.tourSlug,
      startDate: departure.startDate,
      price: departure.price,
      capacity: departure.capacity,
      note: departure.note ?? null,
    });
    summary.departures.added += 1;
  }

  const allDepartures = await db
    .select({
      id: tourDeparturesTable.id,
      tourSlug: tourDeparturesTable.tourSlug,
      startDate: tourDeparturesTable.startDate,
      price: tourDeparturesTable.price,
    })
    .from(tourDeparturesTable);

  const departuresByKey = new Map(
    allDepartures.map((departure) => [
      `${departure.tourSlug}|${departure.startDate}`,
      departure,
    ]),
  );

  const existingBookings = await db
    .select({
      id: bookingsTable.id,
      tourSlug: bookingsTable.tourSlug,
      startDate: bookingsTable.startDate,
      email: bookingsTable.email,
    })
    .from(bookingsTable);

  const bookingByKey = new Map(
    existingBookings.map((booking) => [
      `${booking.tourSlug}|${booking.startDate ?? ""}|${booking.email.toLowerCase()}`,
      booking,
    ]),
  );

  for (const booking of seedBookings) {
    const departure = departuresByKey.get(
      `${booking.tourSlug}|${booking.startDate}`,
    );

    if (!departure) {
      summary.bookings.skipped += 1;
      continue;
    }

    const key = `${booking.tourSlug}|${booking.startDate}|${booking.email.toLowerCase()}`;
    const existing = bookingByKey.get(key);
    const tourTitle =
      staticTours.find((tour) => tour.slug === booking.tourSlug)?.title ??
      booking.tourSlug;

    const values = {
      departureId: departure.id,
      tourSlug: booking.tourSlug,
      tourTitle,
      startDate: booking.startDate,
      name: booking.name,
      email: booking.email.toLowerCase(),
      phone: booking.phone,
      travellers: booking.travellers,
      amount: departure.price * booking.travellers,
      notes: booking.notes ?? null,
      status: booking.status,
    } satisfies typeof bookingsTable.$inferInsert;

    if (existing) {
      if (force) {
        await db
          .update(bookingsTable)
          .set(values)
          .where(eq(bookingsTable.id, existing.id));
        summary.bookings.updated += 1;
      } else {
        summary.bookings.skipped += 1;
      }
      continue;
    }

    await db.insert(bookingsTable).values(values);
    summary.bookings.added += 1;
  }

  const existingEnquiries = await db
    .select({
      id: enquiriesTable.id,
      email: enquiriesTable.email,
      source: enquiriesTable.source,
      message: enquiriesTable.message,
    })
    .from(enquiriesTable);

  const enquiryByKey = new Map(
    existingEnquiries.map((enquiry) => [
      `${enquiry.email.toLowerCase()}|${enquiry.source ?? ""}|${enquiry.message ?? ""}`,
      enquiry,
    ]),
  );

  for (const enquiry of seedEnquiries) {
    const key = `${enquiry.email.toLowerCase()}|${enquiry.source}|${enquiry.message}`;
    const existing = enquiryByKey.get(key);
    const values = {
      type: enquiry.type,
      name: enquiry.name,
      email: enquiry.email.toLowerCase(),
      phone: enquiry.phone,
      destination: enquiry.destination ?? null,
      travellers: enquiry.travellers ?? null,
      travelMonth: enquiry.travelMonth ?? null,
      message: enquiry.message,
      tour: null,
      source: enquiry.source,
      status: enquiry.status,
    } satisfies typeof enquiriesTable.$inferInsert;

    if (existing) {
      if (force) {
        await db
          .update(enquiriesTable)
          .set(values)
          .where(eq(enquiriesTable.id, existing.id));
        summary.enquiries.updated += 1;
      } else {
        summary.enquiries.skipped += 1;
      }
      continue;
    }

    await db.insert(enquiriesTable).values(values);
    summary.enquiries.added += 1;
  }

  return summary;
}

export async function markContentSeeded(db: AppDb) {
  await db
    .insert(settings)
    .values({ settingKey: "content", seeded: 1 })
    .onDuplicateKeyUpdate({ set: { seeded: 1 } });
}

/**
 * Seeds the starter content once, the first time the database is used.
 */
export async function ensureContentSeeded(db: AppDb) {
  const rows = await db
    .select({ seeded: settings.seeded })
    .from(settings)
    .where(eq(settings.settingKey, "content"))
    .limit(1);

  if (rows[0]?.seeded) return;

  await seedStaticContent(db);
  await markContentSeeded(db);
}
