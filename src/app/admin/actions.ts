"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import {
  adminConfigured,
  createAdminSession,
  destroyAdminSession,
  isAdminPassword,
  requireAdmin,
} from "@/lib/admin-auth";
import { dbErrorMessage, getDb, type AppDb } from "@/db";
import {
  destinations as destinationsTable,
  enquiries as enquiriesTable,
  experiences as experiencesTable,
  settings,
  testimonials as testimonialsTable,
  tours as toursTable,
} from "@/db/schema";
import { slugify } from "@/lib/utils";
import { destinations as staticDestinations } from "@/data/destinations";
import type { Destination } from "@/data/destinations";
import { experiences as staticExperiences } from "@/data/experiences";
import type { Experience } from "@/data/experiences";
import { testimonials as staticTestimonials } from "@/data/site";
import type { Testimonial } from "@/data/site";
import { tours as staticTours } from "@/data/tours";
import type { Tour } from "@/data/tours";
import type { EnquiryStatus } from "@/lib/types";

const enquiryStatuses: EnquiryStatus[] = ["new", "contacted", "closed"];

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getLines(formData: FormData, key: string) {
  return getString(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid item id.");
  }
  return id;
}

function messageFor(error: unknown) {
  return dbErrorMessage(error);
}

function fail(path: string, error: unknown): never {
  redirect(`${path}?error=${encodeURIComponent(messageFor(error))}`);
}

function succeed(path: string, notice: string): never {
  redirect(`${path}?notice=${encodeURIComponent(notice)}`);
}

function requireDb(): AppDb {
  const db = getDb();
  if (!db) {
    throw new Error(
      "MySQL is not configured. Add DB_HOST and your credentials, then restart the app.",
    );
  }
  return db;
}

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/tours");
  revalidatePath("/destinations");
  revalidatePath("/experiences");
  revalidatePath("/sitemap.xml");
}

function tourValues(tour: Tour) {
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

function destinationValues(destination: Destination) {
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

function experienceValues(experience: Experience) {
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

function testimonialValues(testimonial: Testimonial) {
  return {
    name: testimonial.name,
    city: testimonial.city,
    tour: testimonial.tour,
    rating: testimonial.rating,
    quote: testimonial.quote,
  } satisfies typeof testimonialsTable.$inferInsert;
}

async function seedAll(db: AppDb) {
  for (const destination of staticDestinations) {
    await db
      .insert(destinationsTable)
      .ignore()
      .values(destinationValues(destination));
  }

  for (const experience of staticExperiences) {
    await db
      .insert(experiencesTable)
      .ignore()
      .values(experienceValues(experience));
  }

  for (const testimonial of staticTestimonials) {
    await db
      .insert(testimonialsTable)
      .ignore()
      .values(testimonialValues(testimonial));
  }

  for (const tour of staticTours) {
    await db.insert(toursTable).ignore().values(tourValues(tour));
  }
}

async function markSeeded(db: AppDb) {
  await db
    .insert(settings)
    .values({ settingKey: "content", seeded: 1 })
    .onDuplicateKeyUpdate({ set: { seeded: 1 } });
}

async function ensureSeeded(db: AppDb) {
  const rows = await db
    .select({ seeded: settings.seeded })
    .from(settings)
    .where(eq(settings.settingKey, "content"))
    .limit(1);

  if (rows[0]?.seeded) return;

  await seedAll(db);
  await markSeeded(db);
}

export async function loginAction(formData: FormData) {
  if (!adminConfigured()) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent(
          "ADMIN_PASSWORD and ADMIN_SESSION_SECRET must be configured.",
        ),
    );
  }

  if (!isAdminPassword(getString(formData, "password"))) {
    redirect(
      "/admin/login?error=" + encodeURIComponent("Incorrect password."),
    );
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function saveTourAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");
  const backPath = id ? `/admin/tours/${id}` : "/admin/tours/new";

  try {
    const db = requireDb();
    const title = getString(formData, "title");

    if (!title) throw new Error("Package title is required.");
    if (!getString(formData, "destinationSlug")) {
      throw new Error("Destination slug is required.");
    }

    const days = formData.getAll("itineraryDay").map(String);
    const itineraryTitles = formData.getAll("itineraryTitle").map(String);
    const itineraryDescriptions = formData
      .getAll("itineraryDescription")
      .map(String);

    const itinerary = itineraryTitles
      .map((itineraryTitle, index) => ({
        day: Number(days[index]) || index + 1,
        title: itineraryTitle.trim(),
        description: (itineraryDescriptions[index] ?? "").trim(),
      }))
      .filter((item) => item.title);

    const oldPriceRaw = getString(formData, "oldPrice");
    const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : undefined;
    const badge = getString(formData, "badge");

    const data: Tour = {
      slug: getString(formData, "slug") || slugify(title),
      title,
      destinationSlug: getString(formData, "destinationSlug"),
      destinationName: getString(formData, "destinationName"),
      region:
        getString(formData, "region") === "International"
          ? "International"
          : "India",
      experiences: getList(formData, "experiences"),
      image: getString(formData, "image"),
      nights: getNumber(formData, "nights"),
      days: getNumber(formData, "days"),
      price: getNumber(formData, "price"),
      oldPrice: Number.isFinite(oldPrice) ? oldPrice : undefined,
      rating: getNumber(formData, "rating", 4.8),
      reviews: getNumber(formData, "reviews"),
      badge: badge || undefined,
      departure: getString(formData, "departure"),
      groupSize: getString(formData, "groupSize"),
      summary: getString(formData, "summary"),
      highlights: getLines(formData, "highlights"),
      inclusions: getLines(formData, "inclusions"),
      exclusions: getLines(formData, "exclusions"),
      itinerary,
      featured: getBoolean(formData, "featured"),
    };

    await ensureSeeded(db);

    if (id) {
      const numericId = parseId(id);
      const existing = await db
        .select({ id: toursTable.id })
        .from(toursTable)
        .where(eq(toursTable.id, numericId))
        .limit(1);
      if (!existing.length) throw new Error("Package not found.");

      await db
        .update(toursTable)
        .set(tourValues(data))
        .where(eq(toursTable.id, numericId));
    } else {
      await db.insert(toursTable).values(tourValues(data));
    }
  } catch (error) {
    fail(backPath, error);
  }

  revalidateContent();
  succeed("/admin/tours", id ? "Package updated." : "Package created.");
}

export async function deleteTourAction(formData: FormData) {
  await requireAdmin();

  try {
    const db = requireDb();
    const [result] = await db
      .delete(toursTable)
      .where(eq(toursTable.id, parseId(getString(formData, "id"))));
    if (!result.affectedRows) throw new Error("Package not found.");
  } catch (error) {
    fail("/admin/tours", error);
  }

  revalidateContent();
  succeed("/admin/tours", "Package deleted.");
}

export async function saveDestinationAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");
  const backPath = id
    ? `/admin/destinations/${id}`
    : "/admin/destinations/new";

  try {
    const db = requireDb();
    const name = getString(formData, "name");
    if (!name) throw new Error("Destination name is required.");

    const data: Destination = {
      slug: getString(formData, "slug") || slugify(name),
      name,
      region:
        getString(formData, "region") === "International"
          ? "International"
          : "India",
      tagline: getString(formData, "tagline"),
      description: getString(formData, "description"),
      image: getString(formData, "image"),
      bestTime: getString(formData, "bestTime"),
      highlights: getLines(formData, "highlights"),
    };

    await ensureSeeded(db);

    if (id) {
      const numericId = parseId(id);
      const existing = await db
        .select({ id: destinationsTable.id })
        .from(destinationsTable)
        .where(eq(destinationsTable.id, numericId))
        .limit(1);
      if (!existing.length) throw new Error("Destination not found.");

      await db
        .update(destinationsTable)
        .set(destinationValues(data))
        .where(eq(destinationsTable.id, numericId));
    } else {
      await db.insert(destinationsTable).values(destinationValues(data));
    }
  } catch (error) {
    fail(backPath, error);
  }

  revalidateContent();
  succeed(
    "/admin/destinations",
    id ? "Destination updated." : "Destination created.",
  );
}

export async function deleteDestinationAction(formData: FormData) {
  await requireAdmin();

  try {
    const db = requireDb();
    const numericId = parseId(getString(formData, "id"));
    const [destination] = await db
      .select({ slug: destinationsTable.slug })
      .from(destinationsTable)
      .where(eq(destinationsTable.id, numericId))
      .limit(1);

    if (!destination) throw new Error("Destination not found.");

    const [linked] = await db
      .select({ value: count() })
      .from(toursTable)
      .where(eq(toursTable.destinationSlug, destination.slug));

    if (Number(linked?.value ?? 0) > 0) {
      throw new Error(
        "This destination still has packages. Move or delete them first.",
      );
    }

    await db
      .delete(destinationsTable)
      .where(eq(destinationsTable.id, numericId));
  } catch (error) {
    fail("/admin/destinations", error);
  }

  revalidateContent();
  succeed("/admin/destinations", "Destination deleted.");
}

export async function saveExperienceAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");
  const backPath = id ? `/admin/experiences/${id}` : "/admin/experiences/new";

  try {
    const db = requireDb();
    const title = getString(formData, "title");
    if (!title) throw new Error("Experience title is required.");

    const icon = getString(formData, "icon");
    const validIcons = [
      "heart",
      "sparkles",
      "mountain",
      "users",
      "crown",
      "flower",
    ];
    if (!validIcons.includes(icon)) throw new Error("Choose a valid icon.");

    const data: Experience = {
      slug: getString(formData, "slug") || slugify(title),
      title,
      shortTitle: getString(formData, "shortTitle") || title,
      description: getString(formData, "description"),
      image: getString(formData, "image"),
      icon: icon as Experience["icon"],
      highlights: getLines(formData, "highlights"),
    };

    await ensureSeeded(db);

    if (id) {
      const numericId = parseId(id);
      const existing = await db
        .select({ id: experiencesTable.id })
        .from(experiencesTable)
        .where(eq(experiencesTable.id, numericId))
        .limit(1);
      if (!existing.length) throw new Error("Experience not found.");

      await db
        .update(experiencesTable)
        .set(experienceValues(data))
        .where(eq(experiencesTable.id, numericId));
    } else {
      await db.insert(experiencesTable).values(experienceValues(data));
    }
  } catch (error) {
    fail(backPath, error);
  }

  revalidateContent();
  succeed(
    "/admin/experiences",
    id ? "Experience updated." : "Experience created.",
  );
}

export async function deleteExperienceAction(formData: FormData) {
  await requireAdmin();

  try {
    const db = requireDb();
    const [result] = await db
      .delete(experiencesTable)
      .where(eq(experiencesTable.id, parseId(getString(formData, "id"))));
    if (!result.affectedRows) throw new Error("Experience not found.");
  } catch (error) {
    fail("/admin/experiences", error);
  }

  revalidateContent();
  succeed("/admin/experiences", "Experience deleted.");
}

export async function saveTestimonialAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");
  const backPath = id ? `/admin/testimonials/${id}` : "/admin/testimonials/new";

  try {
    const db = requireDb();
    const name = getString(formData, "name");
    if (!name) throw new Error("Guest name is required.");

    const data: Testimonial = {
      name,
      city: getString(formData, "city"),
      tour: getString(formData, "tour"),
      rating: getNumber(formData, "rating", 5),
      quote: getString(formData, "quote"),
    };

    await ensureSeeded(db);

    if (id) {
      const numericId = parseId(id);
      const existing = await db
        .select({ id: testimonialsTable.id })
        .from(testimonialsTable)
        .where(eq(testimonialsTable.id, numericId))
        .limit(1);
      if (!existing.length) throw new Error("Testimonial not found.");

      await db
        .update(testimonialsTable)
        .set(testimonialValues(data))
        .where(eq(testimonialsTable.id, numericId));
    } else {
      await db.insert(testimonialsTable).values(testimonialValues(data));
    }
  } catch (error) {
    fail(backPath, error);
  }

  revalidateContent();
  succeed(
    "/admin/testimonials",
    id ? "Testimonial updated." : "Testimonial created.",
  );
}

export async function deleteTestimonialAction(formData: FormData) {
  await requireAdmin();

  try {
    const db = requireDb();
    const [result] = await db
      .delete(testimonialsTable)
      .where(eq(testimonialsTable.id, parseId(getString(formData, "id"))));
    if (!result.affectedRows) throw new Error("Testimonial not found.");
  } catch (error) {
    fail("/admin/testimonials", error);
  }

  revalidateContent();
  succeed("/admin/testimonials", "Testimonial deleted.");
}

export async function updateEnquiryStatusAction(formData: FormData) {
  await requireAdmin();

  try {
    const db = requireDb();
    const status = getString(formData, "status") as EnquiryStatus;

    if (!enquiryStatuses.includes(status)) {
      throw new Error("Invalid enquiry status.");
    }

    const numericId = parseId(getString(formData, "id"));
    const existing = await db
      .select({ id: enquiriesTable.id })
      .from(enquiriesTable)
      .where(eq(enquiriesTable.id, numericId))
      .limit(1);
    if (!existing.length) throw new Error("Enquiry not found.");

    await db
      .update(enquiriesTable)
      .set({ status })
      .where(eq(enquiriesTable.id, numericId));
  } catch (error) {
    fail("/admin/enquiries", error);
  }

  succeed("/admin/enquiries", "Enquiry status updated.");
}

export async function seedContentAction() {
  await requireAdmin();

  try {
    const db = requireDb();
    await seedAll(db);
    await markSeeded(db);
  } catch (error) {
    fail("/admin", error);
  }

  revalidateContent();
  succeed("/admin", "Starter content imported.");
}
