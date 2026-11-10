import {
  bigint,
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
    itinerary: json("itinerary").$type<
      Array<{ day: number; title: string; description: string }>
    >().notNull(),
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

export const settings = mysqlTable("settings", {
  settingKey: varchar("setting_key", { length: 64 }).primaryKey(),
  seeded: tinyint("seeded").notNull().default(0),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export type TourRow = typeof tours.$inferSelect;
export type DestinationRow = typeof destinations.$inferSelect;
export type ExperienceRow = typeof experiences.$inferSelect;
export type TestimonialRow = typeof testimonials.$inferSelect;
export type EnquiryRow = typeof enquiries.$inferSelect;
