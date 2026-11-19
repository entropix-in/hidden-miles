import type { RichFields } from "@/lib/rich-fields";
import type { ItineraryDay } from "@/data/tours";
import {
  bigint,
  date,
  customType,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import type { ContentBlock } from "@/lib/content-blocks";

const photoData = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "mediumblob",
});

export const photos = mysqlTable("photos", {
  id: varchar("id", { length: 64 }).primaryKey(),
  data: photoData("data").notNull(),
});

export const tours = mysqlTable(
  "tours",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    slug: varchar("slug", { length: 190 }).notNull(),
    title: varchar("title", { length: 190 }).notNull(),
    destinationSlug: varchar("destination_slug", { length: 190 }).notNull(),
    destinationName: varchar("destination_name", { length: 190 }).notNull(),
    region: mysqlEnum("region", ["India", "International"])
      .notNull()
      .default("India"),
    experiences: json("experiences").$type<string[]>().notNull(),
    image: varchar("image", { length: 1000 }).notNull(),
    contentBlocks: json("content_blocks").$type<ContentBlock[]>(),
    richFields: json("rich_fields").$type<RichFields>(),
    urlAliases: json("url_aliases").$type<string[]>(),
    nights: int("nights", { unsigned: true }).notNull().default(0),
    days: int("days", { unsigned: true }).notNull().default(1),
    price: int("price", { unsigned: true }).notNull().default(0),
    oldPrice: int("old_price", { unsigned: true }),
    rating: decimal("rating", { precision: 2, scale: 1 })
      .notNull()
      .default("4.8"),
    reviews: int("reviews", { unsigned: true }).notNull().default(0),
    badge: varchar("badge", { length: 80 }),
    departure: varchar("departure", { length: 190 }).notNull().default(""),
    groupSize: varchar("group_size", { length: 80 }).notNull().default(""),
    summary: text("summary").notNull(),
    highlights: json("highlights").$type<string[]>().notNull(),
    inclusions: json("inclusions").$type<string[]>().notNull(),
    exclusions: json("exclusions").$type<string[]>().notNull(),
    itinerary: json("itinerary").$type<ItineraryDay[]>().notNull(),
    departureCities: json("departure_cities").$type<
      Array<{ name: string; note: string; priceDelta: number }>
    >(),
    featured: tinyint("featured").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    uniqueIndex("uniq_tours_slug").on(table.slug),
    index("idx_tours_destination").on(table.destinationSlug),
    index("idx_tours_featured").on(table.featured),
  ],
);

export const destinations = mysqlTable(
  "destinations",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    slug: varchar("slug", { length: 190 }).notNull(),
    name: varchar("name", { length: 190 }).notNull(),
    region: mysqlEnum("region", ["India", "International"])
      .notNull()
      .default("India"),
    tagline: varchar("tagline", { length: 255 }).notNull().default(""),
    description: text("description").notNull(),
    image: varchar("image", { length: 1000 }).notNull(),
    contentBlocks: json("content_blocks").$type<ContentBlock[]>(),
    richFields: json("rich_fields").$type<RichFields>(),
    urlAliases: json("url_aliases").$type<string[]>(),
    bestTime: varchar("best_time", { length: 190 }).notNull().default(""),
    highlights: json("highlights").$type<string[]>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [uniqueIndex("uniq_destinations_slug").on(table.slug)],
);

export const experiences = mysqlTable(
  "experiences",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    slug: varchar("slug", { length: 190 }).notNull(),
    title: varchar("title", { length: 190 }).notNull(),
    shortTitle: varchar("short_title", { length: 120 }).notNull(),
    description: text("description").notNull(),
    image: varchar("image", { length: 1000 }).notNull(),
    contentBlocks: json("content_blocks").$type<ContentBlock[]>(),
    richFields: json("rich_fields").$type<RichFields>(),
    urlAliases: json("url_aliases").$type<string[]>(),
    icon: varchar("icon", { length: 32 }).notNull().default("sparkles"),
    highlights: json("highlights").$type<string[]>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [uniqueIndex("uniq_experiences_slug").on(table.slug)],
);

export const testimonials = mysqlTable("testimonials", {
  id: bigint("id", { mode: "number", unsigned: true })
    .autoincrement()
    .primaryKey(),
  name: varchar("name", { length: 190 }).notNull(),
  city: varchar("city", { length: 120 }).notNull().default(""),
  tour: varchar("tour", { length: 190 }).notNull().default(""),
  rating: tinyint("rating", { unsigned: true }).notNull().default(5),
  quote: text("quote").notNull(),
  richFields: json("rich_fields").$type<RichFields>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const enquiries = mysqlTable(
  "enquiries",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    type: varchar("type", { length: 32 }).notNull().default("enquiry"),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull().default(""),
    destination: varchar("destination", { length: 80 }),
    travellers: varchar("travellers", { length: 20 }),
    travelMonth: varchar("travel_month", { length: 40 }),
    message: text("message"),
    tour: varchar("tour", { length: 190 }),
    source: varchar("source", { length: 190 }),
    status: mysqlEnum("status", ["new", "contacted", "closed"])
      .notNull()
      .default("new"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_enquiries_created_at").on(table.createdAt),
    index("idx_enquiries_status").on(table.status),
  ],
);

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull().default(""),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [uniqueIndex("uniq_users_email").on(table.email)],
);

export const userSessions = mysqlTable(
  "user_sessions",
  {
    // SHA-256 of the cookie token — the raw token is never stored.
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_sessions_user").on(table.userId),
    index("idx_user_sessions_expiry").on(table.expiresAt),
  ],
);

export const settings = mysqlTable("settings", {
  settingKey: varchar("setting_key", { length: 64 }).primaryKey(),
  seeded: tinyint("seeded").notNull().default(0),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export const tourDepartures = mysqlTable(
  "tour_departures",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    tourSlug: varchar("tour_slug", { length: 190 }).notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    price: int("price", { unsigned: true }).notNull().default(0),
    capacity: int("capacity", { unsigned: true }).notNull().default(20),
    note: varchar("note", { length: 190 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    index("idx_departures_tour").on(table.tourSlug),
    index("idx_departures_start_date").on(table.startDate),
  ],
);

export const bookings = mysqlTable(
  "bookings",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),
    departureId: bigint("departure_id", { mode: "number", unsigned: true }),
    userId: bigint("user_id", { mode: "number", unsigned: true }),
    tourSlug: varchar("tour_slug", { length: 190 }).notNull(),
    tourTitle: varchar("tour_title", { length: 190 }).notNull().default(""),
    startDate: date("start_date", { mode: "string" }),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull().default(""),
    travellers: int("travellers", { unsigned: true }).notNull().default(1),
    amount: int("amount", { unsigned: true }).notNull().default(0),
    notes: text("notes"),
    status: mysqlEnum("status", ["pending", "confirmed", "cancelled"])
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_bookings_tour").on(table.tourSlug),
    index("idx_bookings_departure").on(table.departureId),
    index("idx_bookings_user").on(table.userId),
    index("idx_bookings_status").on(table.status),
  ],
);

export type TourRow = typeof tours.$inferSelect;
export type DestinationRow = typeof destinations.$inferSelect;
export type ExperienceRow = typeof experiences.$inferSelect;
export type TestimonialRow = typeof testimonials.$inferSelect;
export type EnquiryRow = typeof enquiries.$inferSelect;
export type DepartureRow = typeof tourDepartures.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type UserSessionRow = typeof userSessions.$inferSelect;
