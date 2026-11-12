import { eq } from "drizzle-orm";
import type { AppDb } from "@/db";
import {
  destinations as destinationsTable,
  experiences as experiencesTable,
  settings,
  testimonials as testimonialsTable,
  tours as toursTable,
} from "@/db/schema";
import { destinations as staticDestinations } from "@/data/destinations";
import type { Destination } from "@/data/destinations";
import { experiences as staticExperiences } from "@/data/experiences";
import type { Experience } from "@/data/experiences";
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
