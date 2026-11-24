"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq, and, ne, inArray, sql } from "drizzle-orm";
import {
  adminConfigured,
  createAdminSession,
  destroyAdminSession,
  isAdminPassword,
  requireAdmin,
} from "@/lib/admin-auth";
import { dbErrorMessage, getDb, type AppDb } from "@/db";
import { FieldError, fieldOf } from "@/lib/field-error";
import {
  bookings as bookingsTable,
  destinations as destinationsTable,
  enquiries as enquiriesTable,
  photos,
  experiences as experiencesTable,
  testimonials as testimonialsTable,
  tourDepartures as tourDeparturesTable,
  tours as toursTable,
} from "@/db/schema";
import { readRichValues, type RichFields } from "@/lib/rich-fields";
import { parseContentBlocks, readContentText, type ContentBlock } from "@/lib/content-blocks";
import { mediaPathPattern } from "@/lib/media-path";
import { slugify } from "@/lib/utils";
import type { Destination } from "@/data/destinations";
import { experienceIconLabels, type Experience } from "@/data/experiences";
import type { Testimonial } from "@/data/site";
import type { ItineraryBadge, ItineraryBadgeKind, Tour } from "@/data/tours";
import type { EnquiryStatus } from "@/lib/types";
import { parseTourCities } from "@/lib/tour-cities";
import {
  ensureContentSeeded,
  markContentSeeded,
  seedStaticContent,
  destinationValues,
  experienceValues,
  testimonialValues,
  tourValues,
} from "@/lib/seed";

const enquiryStatuses: EnquiryStatus[] = ["new", "contacted", "closed"];

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function coverPhoto(formData: FormData, existing?: string) {
  const image = getString(formData, "image");
  if (mediaPathPattern.test(image) || (image && image === existing)) return image;
  throw new FieldError("image", "Upload a cover photo.");
}

async function requireSavedPhotos(db: AppDb, cover: string, blocks: ContentBlock[] = []) {
  const urls = [cover, ...blocks.flatMap((block) =>
    block.type === "gallery" ? block.photos.map((photo) => photo.url) : [])];
  const ids = [...new Set(urls.filter((url) => mediaPathPattern.test(url)).map((url) => url.split("/").at(-1)!))];
  if (!ids.length) return;

  const found = await db.select({ id: photos.id }).from(photos).where(inArray(photos.id, ids));
  if (found.length !== ids.length) throw new FieldError("image", "A photo is missing. Upload it again before saving.");
}

function getNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getLines(formData: FormData, key: string) {
  return formData.getAll(key)
    .flatMap((value) => String(value).split("\n"))
    .map((line) => line.trim())
    .filter(Boolean);
}

function richText(formData: FormData, name: "description" | "summary" | "quote") {
  const info = readRichValues(formData, name)[0];
  return { text: formData.has(name + "Rich") ? info?.text ?? "" : getString(formData, name), editor: info?.editor };
}

function richList(formData: FormData, name: "highlights" | "inclusions" | "exclusions") {
  const items = readRichValues(formData, name);
  return {
    text: formData.has(name + "Rich") ? items.map((item) => item.text) : getLines(formData, name),
    editors: items.length ? items.map((item) => item.editor) : undefined,
  };
}

function updatedAliases(current: { slug: string; aliases: string[] | null }, slug: string) {
  return [...new Set([...(current.aliases ?? []), current.slug])].filter((alias) => alias !== slug);
}

function getList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

const itineraryBadgeKinds: ItineraryBadgeKind[] = [
  "meal",
  "stay",
  "travel",
  "experience",
  "leisure",
];

function parseItineraryBadges(raw: string): ItineraryBadge[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const badges: ItineraryBadge[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const candidate = item as { label?: unknown; kind?: unknown };
      const label =
        typeof candidate.label === "string"
          ? candidate.label.trim().slice(0, 40)
          : "";
      const kind = candidate.kind as ItineraryBadgeKind;

      if (!label || !itineraryBadgeKinds.includes(kind)) continue;
      if (
        badges.some(
          (badge) => badge.label.toLowerCase() === label.toLowerCase(),
        )
      ) {
        continue;
      }

      badges.push({ label, kind });
      if (badges.length === 8) break;
    }

    return badges;
  } catch {
    return [];
  }
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

function errorField(error: unknown) {
  const code = (error as { code?: string; cause?: { code?: string } }).code
    ?? (error as { cause?: { code?: string } }).cause?.code;
  return fieldOf(error) ?? (code === "ER_DUP_ENTRY" ? "slug" : undefined);
}

function withParam(path: string, key: string, value: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

function flashId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function fail(path: string, error: unknown): never {
  redirect(
    withParam(
      withParam(path, "error", messageFor(error)),
      "flash",
      flashId(),
    ),
  );
}

function succeed(path: string, notice: string): never {
  redirect(
    withParam(withParam(path, "notice", notice), "flash", flashId()),
  );
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

function pageSlug(formData: FormData, title: string) {
  const slug = getString(formData, "slug") || slugify(title);
  if (slug.length > 190 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new FieldError("slug", "Edit the page URL to use lowercase letters, numbers, and single hyphens.");
  }
  return slug;
}

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/tours");
  revalidatePath("/destinations");
  revalidatePath("/experiences");
  revalidatePath("/speciality-tours");
  revalidatePath("/tours/[slug]", "page");
  revalidatePath("/destinations/[slug]", "page");
  revalidatePath("/speciality-tours/[slug]", "page");
  revalidatePath("/sitemap.xml");
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

  try {
    const db = requireDb();
    const title = getString(formData, "title");

    if (!title) throw new FieldError("title", "Package title is required.");
    const destinationSlug = getString(formData, "destinationSlug");
    if (!destinationSlug) throw new FieldError("destinationSlug", "Choose a destination.");

    const days = formData.getAll("itineraryDay").map(String);
    const itineraryTitles = formData.getAll("itineraryTitle").map(String);
    const itineraryDescriptions = formData
      .getAll("itineraryDescription")
      .map(String);
    const itineraryBadges = formData.getAll("itineraryBadges").map(String);
    const itineraryContent = formData.getAll("itineraryContent").map(String);
    const itinerary = itineraryTitles.flatMap((rawTitle, index) => {
      const title = rawTitle.trim();
      const contentBlocks = parseContentBlocks(itineraryContent[index] ?? "");
      const badges = parseItineraryBadges(itineraryBadges[index] ?? "");
      if (!title) {
        if (contentBlocks.length || badges.length) throw new FieldError("itineraryTitle", `Add a title for itinerary day ${index + 1}.`);
        return [];
      }
      return [{
        day: Number(days[index]) || index + 1,
        title,
        description: itineraryContent.length
          ? readContentText(contentBlocks) : (itineraryDescriptions[index] ?? "").trim(),
        contentBlocks,
        badges,
        manualBadges: itineraryContent.length > 0 && itineraryBadges[index] !== "",
      }];
    });

    const oldPriceRaw = getString(formData, "oldPrice");
    const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : undefined;
    const childPriceRaw = getString(formData, "childPrice");
    const childPrice = childPriceRaw ? Number(childPriceRaw) : undefined;
    const infantPriceRaw = getString(formData, "infantPrice");
    const infantPrice = infantPriceRaw ? Number(infantPriceRaw) : undefined;
    const badge = getString(formData, "badge");
    const departureCities = parseTourCities(
      getString(formData, "departureCities"),
    );

    if (!departureCities.length) {
      throw new FieldError("departureCities", "Add at least one departure city.");
    }

    await ensureContentSeeded(db);
    const [existingPhoto] = id ? await db.select({ image: toursTable.image, destinationSlug: toursTable.destinationSlug, destinationName: toursTable.destinationName, region: toursTable.region })
      .from(toursTable).where(eq(toursTable.id, parseId(id))).limit(1) : [];
    if (id && !existingPhoto) throw new Error("Package not found.");
    const [destination] = await db.select({
      name: destinationsTable.name, region: destinationsTable.region,
    }).from(destinationsTable).where(eq(destinationsTable.slug, destinationSlug)).limit(1);
    const legacyDestination = existingPhoto?.destinationSlug === destinationSlug ? existingPhoto : undefined;
    if (!destination && !legacyDestination) throw new FieldError("destinationSlug", "Choose an existing destination.");
    const summary = richText(formData, "summary");
    const highlights = richList(formData, "highlights");
    const inclusions = richList(formData, "inclusions");
    const exclusions = richList(formData, "exclusions");
    const data: Tour = {
      slug: pageSlug(formData, title),
      title,
      destinationSlug,
      destinationName: destination?.name ?? legacyDestination!.destinationName,
      region: destination?.region ?? legacyDestination!.region,
      experiences: getList(formData, "experiences"),
      image: coverPhoto(formData, existingPhoto?.image),
      contentBlocks: parseContentBlocks(getString(formData, "contentBlocks")),
      nights: getNumber(formData, "nights"),
      days: getNumber(formData, "days"),
      price: getNumber(formData, "price"),
      childPrice: Number.isFinite(childPrice) ? childPrice : undefined,
      infantPrice: Number.isFinite(infantPrice) ? infantPrice : undefined,
      oldPrice: Number.isFinite(oldPrice) ? oldPrice : undefined,
      rating: getNumber(formData, "rating", 4.8),
      reviews: getNumber(formData, "reviews"),
      badge: badge || undefined,
      departure: getString(formData, "departure"),
      groupSize: getString(formData, "groupSize"),
      summary: summary.text,
      highlights: highlights.text,
      inclusions: inclusions.text,
      exclusions: exclusions.text,
      itinerary,
      departureCities,
      featured: getBoolean(formData, "featured"),
      richFields: { summary: summary.editor, highlights: highlights.editors, inclusions: inclusions.editors, exclusions: exclusions.editors } satisfies RichFields,
    };

    await requireSavedPhotos(db, data.image, [...(data.contentBlocks ?? []), ...itinerary.flatMap((day) => day.contentBlocks)]);
    if (id) {
      const numericId = parseId(id);
      await db.transaction(async (tx) => {
        const [current] = await tx.select({ slug: toursTable.slug, aliases: toursTable.urlAliases }).from(toursTable)
          .where(eq(toursTable.id, numericId)).for("update");
        if (!current) throw new Error("Package not found.");
        await tx.update(toursTable).set({ ...tourValues(data), urlAliases: updatedAliases(current, data.slug) }).where(eq(toursTable.id, numericId));
        if (current.slug !== data.slug) {
          await tx.update(tourDeparturesTable).set({ tourSlug: data.slug }).where(eq(tourDeparturesTable.tourSlug, current.slug));
          await tx.update(bookingsTable).set({ tourSlug: data.slug }).where(eq(bookingsTable.tourSlug, current.slug));
        }
      });
    } else {
      await db.insert(toursTable).values(tourValues(data));
    }
  } catch (error) {
    return { error: messageFor(error), field: errorField(error) };
  }

  revalidateContent();
  succeed("/admin/tours", id ? "Package updated." : "Package added.");
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

export async function persistDestinationAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");

  try {
    const db = requireDb();
    const name = getString(formData, "name");
    if (!name) throw new FieldError("name", "Destination name is required.");

    const [existingPhoto] = id ? await db.select({ image: destinationsTable.image })
      .from(destinationsTable).where(eq(destinationsTable.id, parseId(id))).limit(1) : [];
    if (id && !existingPhoto) throw new Error("Destination not found.");
    const description = richText(formData, "description");
    const highlights = richList(formData, "highlights");
    const data: Destination = {
      slug: pageSlug(formData, name),
      name,
      region:
        getString(formData, "region") === "International"
          ? "International"
          : "India",
      tagline: getString(formData, "tagline"),
      description: description.text,
      image: coverPhoto(formData, existingPhoto?.image),
      contentBlocks: parseContentBlocks(getString(formData, "contentBlocks")),
      bestTime: getString(formData, "bestTime"),
      highlights: highlights.text,
      richFields: { description: description.editor, highlights: highlights.editors } satisfies RichFields,
    };

    await requireSavedPhotos(db, data.image, data.contentBlocks);
    await ensureContentSeeded(db);

    if (id) {
      const numericId = parseId(id);
      await db.transaction(async (tx) => {
        const [current] = await tx.select({ slug: destinationsTable.slug, aliases: destinationsTable.urlAliases }).from(destinationsTable)
          .where(eq(destinationsTable.id, numericId)).for("update");
        if (!current) throw new Error("Destination not found.");
        await tx.update(destinationsTable).set({ ...destinationValues(data), urlAliases: updatedAliases(current, data.slug) }).where(eq(destinationsTable.id, numericId));
        await tx.update(toursTable).set({
          destinationSlug: data.slug, destinationName: data.name, region: data.region,
        }).where(eq(toursTable.destinationSlug, current.slug));
      });
    } else {
      await db.insert(destinationsTable).values(destinationValues(data));
    }
    revalidateContent();
    return { destination: { slug: data.slug, name: data.name, region: data.region } };
  } catch (error) {
    return { error: messageFor(error), field: errorField(error) };
  }

}

export async function saveDestinationAction(formData: FormData) {
  const result = await persistDestinationAction(formData);
  if (result.error) return { error: result.error, field: result.field };
  succeed("/admin/destinations", getString(formData, "id") ? "Destination updated." : "Destination added.");
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

export async function persistExperienceAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");

  try {
    const db = requireDb();
    const title = getString(formData, "title");
    if (!title) throw new FieldError("title", "Experience title is required.");

    const icon = getString(formData, "icon");
    if (!Object.hasOwn(experienceIconLabels, icon)) throw new FieldError("icon", "Choose a valid icon.");

    const [existingPhoto] = id ? await db.select({ image: experiencesTable.image })
      .from(experiencesTable).where(eq(experiencesTable.id, parseId(id))).limit(1) : [];
    if (id && !existingPhoto) throw new Error("Experience not found.");
    const description = richText(formData, "description");
    const highlights = richList(formData, "highlights");
    const data: Experience = {
      slug: pageSlug(formData, title),
      title,
      shortTitle: getString(formData, "shortTitle") || title,
      description: description.text,
      image: coverPhoto(formData, existingPhoto?.image),
      contentBlocks: parseContentBlocks(getString(formData, "contentBlocks")),
      icon: icon as Experience["icon"],
      highlights: highlights.text,
      richFields: { description: description.editor, highlights: highlights.editors } satisfies RichFields,
    };

    await requireSavedPhotos(db, data.image, data.contentBlocks);
    await ensureContentSeeded(db);

    if (id) {
      const numericId = parseId(id);
      await db.transaction(async (tx) => {
        const [current] = await tx.select({ slug: experiencesTable.slug, aliases: experiencesTable.urlAliases }).from(experiencesTable)
          .where(eq(experiencesTable.id, numericId)).for("update");
        if (!current) throw new Error("Experience not found.");
        await tx.update(experiencesTable).set({ ...experienceValues(data), urlAliases: updatedAliases(current, data.slug) }).where(eq(experiencesTable.id, numericId));
        if (current.slug !== data.slug) {
          const linked = sql`JSON_SEARCH(${toursTable.experiences}, 'one', ${current.slug})`;
          await tx.update(toursTable)
            .set({ experiences: sql`JSON_SET(${toursTable.experiences}, JSON_UNQUOTE(${linked}), ${data.slug})` })
            .where(sql`${linked} IS NOT NULL`);
        }
      });
    } else {
      await db.insert(experiencesTable).values(experienceValues(data));
    }
    revalidateContent();
    return { experience: { slug: data.slug, title: data.title, shortTitle: data.shortTitle } };
  } catch (error) {
    return { error: messageFor(error), field: errorField(error) };
  }
}

export async function saveExperienceAction(formData: FormData) {
  const result = await persistExperienceAction(formData);
  if (result.error) return { error: result.error, field: result.field };
  succeed("/admin/experiences", getString(formData, "id") ? "Experience updated." : "Experience added.");
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

    const quote = richText(formData, "quote");
    const data: Testimonial = {
      name,
      city: getString(formData, "city"),
      tour: getString(formData, "tour"),
      rating: getNumber(formData, "rating", 5),
      quote: quote.text,
      richFields: { quote: quote.editor } satisfies RichFields,
    };

    await ensureContentSeeded(db);

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
    id ? "Testimonial updated." : "Testimonial added.",
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
  const requested = getString(formData, "returnTo");
  const back = /^\/admin\/enquiries(?:\/\d+)?(?:\?|$)/.test(requested) ? requested : "/admin/enquiries";

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
    fail(back, error);
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  succeed(back, "Enquiry status updated.");
}

export async function seedContentAction() {
  await requireAdmin();

  try {
    const db = requireDb();
    await seedStaticContent(db);
    await markContentSeeded(db);
  } catch (error) {
    fail("/admin", error);
  }

  revalidateContent();
  succeed("/admin", "Starter content imported.");
}

const bookingStatuses = ["pending", "confirmed", "cancelled"] as const;

function bookingsBackPath(formData: FormData) {
  const returnTo = getString(formData, "returnTo");
  return /^\/admin\/bookings(?:[/?]|$)/.test(returnTo) ? returnTo : "/admin/bookings";
}

function departuresBackPath(formData: FormData) {
  const returnTo = getString(formData, "returnTo");
  if (/^\/admin\/departures(?:[/?]|$)/.test(returnTo)) return returnTo;
  const slug = getString(formData, "tourSlug");
  return slug ? `/admin/departures?tour=${encodeURIComponent(slug)}` : "/admin/departures";
}

export async function saveDepartureAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData, "id");
  const tourSlug = getString(formData, "tourSlug");
  const backPath = departuresBackPath(formData);

  let message = "Departure updated.";

  try {
    const db = requireDb();
    const dates = [
      ...new Set(
        formData
          .getAll("startDate")
          .map((value) => String(value).trim())
          .filter(Boolean),
      ),
    ].sort();
    const price = getNumber(formData, "price");
    const capacity = getNumber(formData, "capacity", 20);
    const note = getString(formData, "note");

    if (!tourSlug) throw new FieldError("tourSlug", "Choose a tour package first.");
    if (!dates.length) throw new FieldError("startDate", "Choose at least one departure date.");
    if (dates.some((startDate) => {
      const date = new Date(`${startDate}T00:00:00Z`);
      return !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
        || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== startDate;
    })) {
      throw new FieldError("startDate", "Choose valid departure dates.");
    }
    if (price <= 0) throw new FieldError("price", "Price must be greater than zero.");
    if (capacity <= 0) throw new FieldError("capacity", "Seats per date must be at least 1.");

    await ensureContentSeeded(db);

    if (id) {
      const numericId = parseId(id);
      const [existing] = await db
        .select({ id: tourDeparturesTable.id, tourSlug: tourDeparturesTable.tourSlug, startDate: tourDeparturesTable.startDate })
        .from(tourDeparturesTable)
        .where(eq(tourDeparturesTable.id, numericId))
        .limit(1);
      if (existing?.tourSlug !== tourSlug) throw new Error("Departure not found.");
      if (existing.startDate !== dates[0]) {
        const [duplicate] = await db.select({ id: tourDeparturesTable.id }).from(tourDeparturesTable)
          .where(and(eq(tourDeparturesTable.tourSlug, tourSlug), eq(tourDeparturesTable.startDate, dates[0]))).limit(1);
        if (duplicate) throw new FieldError("startDate", "That date is already scheduled for this package.");
      }

      await db
        .update(tourDeparturesTable)
        .set({
          tourSlug,
          startDate: dates[0],
          price,
          capacity,
          note: note || null,
        })
        .where(eq(tourDeparturesTable.id, numericId));

      message = "Departure updated.";
    } else {
      const [tour] = await db.select({ id: toursTable.id }).from(toursTable).where(eq(toursTable.slug, tourSlug)).limit(1);
      if (!tour) throw new FieldError("tourSlug", "Choose an existing package.");
      const existingRows = await db
        .select({ startDate: tourDeparturesTable.startDate })
        .from(tourDeparturesTable)
        .where(eq(tourDeparturesTable.tourSlug, tourSlug));
      const existingDates = new Set(
        existingRows.map((row) => String(row.startDate)),
      );
      const datesToAdd = dates.filter(
        (startDate) => !existingDates.has(startDate),
      );

      if (!datesToAdd.length) {
        throw new FieldError("startDate", "Those dates already exist for this tour.");
      }

      await db.insert(tourDeparturesTable).values(
        datesToAdd.map((startDate) => ({
          tourSlug,
          startDate,
          price,
          capacity,
          note: note || null,
        })),
      );

      const skipped = dates.length - datesToAdd.length;
      message = `${
        datesToAdd.length === 1
          ? "Departure added"
          : `${datesToAdd.length} departures added`
      }.${
        skipped
          ? ` ${skipped} already existed and ${
              skipped === 1 ? "was" : "were"
            } skipped.`
          : ""
      }`;
    }
  } catch (error) {
    return { error: messageFor(error), field: errorField(error) };
  }

  revalidatePath(`/tours/${tourSlug}`);
  revalidatePath("/admin/departures");
  revalidatePath("/admin/bookings");
  succeed(backPath, message);
}

export async function deleteDepartureAction(formData: FormData) {
  await requireAdmin();

  const backPath = departuresBackPath(formData);

  try {
    const db = requireDb();
    const numericId = parseId(getString(formData, "id"));

    const [departure] = await db
      .select({
        tourSlug: tourDeparturesTable.tourSlug,
      })
      .from(tourDeparturesTable)
      .where(eq(tourDeparturesTable.id, numericId))
      .limit(1);
    if (!departure) throw new Error("Departure not found.");

    const [activeBookings] = await db
      .select({ value: count() })
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.departureId, numericId),
          ne(bookingsTable.status, "cancelled"),
        ),
      );
    if (Number(activeBookings?.value ?? 0) > 0) {
      throw new Error(
        "This departure has bookings. Cancel them before deleting the date.",
      );
    }

    await db
      .delete(tourDeparturesTable)
      .where(eq(tourDeparturesTable.id, numericId));

    revalidatePath(`/tours/${departure.tourSlug}`);
  } catch (error) {
    fail(backPath, error);
  }

  revalidatePath("/admin/departures");
  revalidatePath("/admin/bookings");
  succeed(backPath, "Departure deleted.");
}

export async function updateBookingStatusAction(formData: FormData) {
  await requireAdmin();

  const backPath = bookingsBackPath(formData);

  try {
    const db = requireDb();
    const status = getString(formData, "status") as (typeof bookingStatuses)[number];

    if (!bookingStatuses.includes(status)) {
      throw new Error("Invalid booking status.");
    }

    const numericId = parseId(getString(formData, "id"));
    const [result] = await db
      .update(bookingsTable)
      .set({ status })
      .where(eq(bookingsTable.id, numericId));

    if (!result.affectedRows) throw new Error("Booking not found.");
  } catch (error) {
    fail(backPath, error);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/departures");
  succeed(backPath, "Booking status updated.");
}

export async function deleteBookingAction(formData: FormData) {
  await requireAdmin();

  const backPath = bookingsBackPath(formData);

  try {
    const db = requireDb();
    const [booking] = await db
      .select({ tourSlug: bookingsTable.tourSlug })
      .from(bookingsTable)
      .where(eq(bookingsTable.id, parseId(getString(formData, "id"))))
      .limit(1);
    if (!booking) throw new Error("Booking not found.");

    await db
      .delete(bookingsTable)
      .where(eq(bookingsTable.id, parseId(getString(formData, "id"))));

    revalidatePath(`/tours/${booking.tourSlug}`);
  } catch (error) {
    fail(backPath, error);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/departures");
  succeed(backPath, "Booking deleted.");
}
