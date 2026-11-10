"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminConfigured,
  createAdminSession,
  destroyAdminSession,
  isAdminPassword,
  requireAdmin,
} from "@/lib/admin-auth";
import {
  dbErrorMessage,
  dbExecute,
  dbQuery,
  isDbConfigured,
} from "@/lib/db";
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

const TOUR_COLUMNS = [
  "slug",
  "title",
  "destination_slug",
  "destination_name",
  "region",
  "experiences",
  "image",
  "nights",
  "days",
  "price",
  "old_price",
  "rating",
  "reviews",
  "badge",
  "departure",
  "group_size",
  "summary",
  "highlights",
  "inclusions",
  "exclusions",
  "itinerary",
  "featured",
] as const;

const DESTINATION_COLUMNS = [
  "slug",
  "name",
  "region",
  "tagline",
  "description",
  "image",
  "best_time",
  "highlights",
] as const;

const EXPERIENCE_COLUMNS = [
  "slug",
  "title",
  "short_title",
  "description",
  "image",
  "icon",
  "highlights",
] as const;

const TESTIMONIAL_COLUMNS = ["name", "city", "tour", "rating", "quote"] as const;

function insertSql(table: string, columns: readonly string[], ignore = false) {
  return `INSERT ${ignore ? "IGNORE " : ""}INTO ${table} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
}

function updateSql(table: string, columns: readonly string[]) {
  return `UPDATE ${table} SET ${columns.map((column) => `${column} = ?`).join(", ")} WHERE id = ?`;
}

const TOUR_INSERT = insertSql("tours", TOUR_COLUMNS);
const TOUR_INSERT_IGNORE = insertSql("tours", TOUR_COLUMNS, true);
const TOUR_UPDATE = updateSql("tours", TOUR_COLUMNS);
const DESTINATION_INSERT = insertSql("destinations", DESTINATION_COLUMNS);
const DESTINATION_INSERT_IGNORE = insertSql(
  "destinations",
  DESTINATION_COLUMNS,
  true,
);
const DESTINATION_UPDATE = updateSql("destinations", DESTINATION_COLUMNS);
const EXPERIENCE_INSERT = insertSql("experiences", EXPERIENCE_COLUMNS);
const EXPERIENCE_INSERT_IGNORE = insertSql(
  "experiences",
  EXPERIENCE_COLUMNS,
  true,
);
const EXPERIENCE_UPDATE = updateSql("experiences", EXPERIENCE_COLUMNS);
const TESTIMONIAL_INSERT = insertSql("testimonials", TESTIMONIAL_COLUMNS);
const TESTIMONIAL_INSERT_IGNORE = insertSql(
  "testimonials",
  TESTIMONIAL_COLUMNS,
  true,
);
const TESTIMONIAL_UPDATE = updateSql("testimonials", TESTIMONIAL_COLUMNS);
const MARK_SEEDED =
  "INSERT INTO settings (setting_key, seeded) VALUES ('content', 1) ON DUPLICATE KEY UPDATE seeded = 1";

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

function ensureDb() {
  if (!isDbConfigured()) {
    throw new Error(
      "MySQL is not configured. Add DB_HOST and your credentials, then restart the app.",
    );
  }
}

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/tours");
  revalidatePath("/destinations");
  revalidatePath("/experiences");
  revalidatePath("/sitemap.xml");
}

function tourValues(tour: Tour) {
  return [
    tour.slug,
    tour.title,
    tour.destinationSlug,
    tour.destinationName,
    tour.region,
    JSON.stringify(tour.experiences),
    tour.image,
    tour.nights,
    tour.days,
    tour.price,
    tour.oldPrice ?? null,
    tour.rating,
    tour.reviews,
    tour.badge ?? null,
    tour.departure,
    tour.groupSize,
    tour.summary,
    JSON.stringify(tour.highlights),
    JSON.stringify(tour.inclusions),
    JSON.stringify(tour.exclusions),
    JSON.stringify(tour.itinerary),
    tour.featured ? 1 : 0,
  ];
}

function destinationValues(destination: Destination) {
  return [
    destination.slug,
    destination.name,
    destination.region,
    destination.tagline,
    destination.description,
    destination.image,
    destination.bestTime,
    JSON.stringify(destination.highlights),
  ];
}

function experienceValues(experience: Experience) {
  return [
    experience.slug,
    experience.title,
    experience.shortTitle,
    experience.description,
    experience.image,
    experience.icon,
    JSON.stringify(experience.highlights),
  ];
}

function testimonialValues(testimonial: Testimonial) {
  return [
    testimonial.name,
    testimonial.city,
    testimonial.tour,
    testimonial.rating,
    testimonial.quote,
  ];
}

async function seedAll() {
  for (const destination of staticDestinations) {
    await dbExecute(DESTINATION_INSERT_IGNORE, destinationValues(destination));
  }

  for (const experience of staticExperiences) {
    await dbExecute(EXPERIENCE_INSERT_IGNORE, experienceValues(experience));
  }

  for (const testimonial of staticTestimonials) {
    await dbExecute(TESTIMONIAL_INSERT_IGNORE, testimonialValues(testimonial));
  }

  for (const tour of staticTours) {
    await dbExecute(TOUR_INSERT_IGNORE, tourValues(tour));
  }
}

async function markSeeded() {
  await dbExecute(MARK_SEEDED);
}

async function ensureSeeded() {
  const rows = await dbQuery<Array<{ seeded: number }>>(
    "SELECT seeded FROM settings WHERE setting_key = 'content' LIMIT 1",
  );

  if (rows[0]?.seeded) return;

  await seedAll();
  await markSeeded();
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
    ensureDb();
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

    await ensureSeeded();

    if (id) {
      const numericId = parseId(id);
      const existing = await dbQuery<Array<{ id: number }>>(
        "SELECT id FROM tours WHERE id = ? LIMIT 1",
        [numericId],
      );
      if (!existing.length) throw new Error("Package not found.");

      await dbExecute(TOUR_UPDATE, [...tourValues(data), numericId]);
    } else {
      await dbExecute(TOUR_INSERT, tourValues(data));
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
    ensureDb();
    const result = await dbExecute("DELETE FROM tours WHERE id = ?", [
      parseId(getString(formData, "id")),
    ]);
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
    ensureDb();
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

    await ensureSeeded();

    if (id) {
      const numericId = parseId(id);
      const existing = await dbQuery<Array<{ id: number }>>(
        "SELECT id FROM destinations WHERE id = ? LIMIT 1",
        [numericId],
      );
      if (!existing.length) throw new Error("Destination not found.");

      await dbExecute(DESTINATION_UPDATE, [
        ...destinationValues(data),
        numericId,
      ]);
    } else {
      await dbExecute(DESTINATION_INSERT, destinationValues(data));
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
    ensureDb();
    const numericId = parseId(getString(formData, "id"));
    const destinations = await dbQuery<Array<{ slug: string }>>(
      "SELECT slug FROM destinations WHERE id = ? LIMIT 1",
      [numericId],
    );

    if (!destinations.length) throw new Error("Destination not found.");

    const linked = await dbQuery<Array<{ count: number }>>(
      "SELECT COUNT(*) AS count FROM tours WHERE destination_slug = ?",
      [destinations[0].slug],
    );

    if (Number(linked[0]?.count) > 0) {
      throw new Error(
        "This destination still has packages. Move or delete them first.",
      );
    }

    await dbExecute("DELETE FROM destinations WHERE id = ?", [numericId]);
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
    ensureDb();
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

    await ensureSeeded();

    if (id) {
      const numericId = parseId(id);
      const existing = await dbQuery<Array<{ id: number }>>(
        "SELECT id FROM experiences WHERE id = ? LIMIT 1",
        [numericId],
      );
      if (!existing.length) throw new Error("Experience not found.");

      await dbExecute(EXPERIENCE_UPDATE, [
        ...experienceValues(data),
        numericId,
      ]);
    } else {
      await dbExecute(EXPERIENCE_INSERT, experienceValues(data));
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
    ensureDb();
    const result = await dbExecute("DELETE FROM experiences WHERE id = ?", [
      parseId(getString(formData, "id")),
    ]);
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
    ensureDb();
    const name = getString(formData, "name");
    if (!name) throw new Error("Guest name is required.");

    const data: Testimonial = {
      name,
      city: getString(formData, "city"),
      tour: getString(formData, "tour"),
      rating: getNumber(formData, "rating", 5),
      quote: getString(formData, "quote"),
    };

    await ensureSeeded();

    if (id) {
      const numericId = parseId(id);
      const existing = await dbQuery<Array<{ id: number }>>(
        "SELECT id FROM testimonials WHERE id = ? LIMIT 1",
        [numericId],
      );
      if (!existing.length) throw new Error("Testimonial not found.");

      await dbExecute(TESTIMONIAL_UPDATE, [
        ...testimonialValues(data),
        numericId,
      ]);
    } else {
      await dbExecute(TESTIMONIAL_INSERT, testimonialValues(data));
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
    ensureDb();
    const result = await dbExecute("DELETE FROM testimonials WHERE id = ?", [
      parseId(getString(formData, "id")),
    ]);
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
    ensureDb();
    const status = getString(formData, "status") as EnquiryStatus;

    if (!enquiryStatuses.includes(status)) {
      throw new Error("Invalid enquiry status.");
    }

    const numericId = parseId(getString(formData, "id"));
    const existing = await dbQuery<Array<{ id: number }>>(
      "SELECT id FROM enquiries WHERE id = ? LIMIT 1",
      [numericId],
    );
    if (!existing.length) throw new Error("Enquiry not found.");

    await dbExecute("UPDATE enquiries SET status = ? WHERE id = ?", [
      status,
      numericId,
    ]);
  } catch (error) {
    fail("/admin/enquiries", error);
  }

  succeed("/admin/enquiries", "Enquiry status updated.");
}

export async function seedContentAction() {
  await requireAdmin();

  try {
    ensureDb();
    await seedAll();
    await markSeeded();
  } catch (error) {
    fail("/admin", error);
  }

  revalidateContent();
  succeed("/admin", "Starter content imported.");
}
