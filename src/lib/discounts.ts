import "server-only";
import { and, count, eq, gte, inArray, isNull, lte, ne, or, sql } from "drizzle-orm";
import type { AppDb } from "@/db";
import { bookings, discounts, discountTours, tours, type DiscountRow } from "@/db/schema";
import type { DiscountRule } from "./pricing";

export function normalizeCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase().replace(/\s+/g, "").slice(0, 40) : "";
}

export function toDiscountRule(row: DiscountRow): DiscountRule {
  return {
    id: String(row.id),
    name: row.name,
    code: row.code ?? undefined,
    kind: row.kind,
    value: Number(row.value),
    maxAmount: row.maxAmount === null ? undefined : Number(row.maxAmount),
    minTravellers: Math.max(1, Number(row.minTravellers)),
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Discounts that can apply to a package right now: active, inside their date window,
 * under their usage limit, and either sitewide or linked to this package.
 * Automatic discounts (no code) are always returned; a coded one only when `code` matches.
 */
export async function availableDiscounts(db: AppDb, tourSlug: string, code?: string): Promise<DiscountRow[]> {
  const [tour] = await db.select({ id: tours.id }).from(tours).where(eq(tours.slug, tourSlug)).limit(1);
  if (!tour) return [];
  const date = today();
  const linked = db.select({ id: discountTours.discountId }).from(discountTours)
    .where(eq(discountTours.tourId, Number(tour.id)));

  const rows = await db.select().from(discounts).where(and(
    eq(discounts.active, true),
    or(isNull(discounts.startsOn), lte(discounts.startsOn, date)),
    or(isNull(discounts.endsOn), gte(discounts.endsOn, date)),
    or(eq(discounts.scope, "all"), inArray(discounts.id, linked)),
    code ? or(isNull(discounts.code), eq(discounts.code, code)) : isNull(discounts.code),
  ));

  const limited = rows.filter((row) => row.usageLimit !== null);
  if (!limited.length) return rows;
  const used = await discountUsage(db, limited.map((row) => Number(row.id)));
  return rows.filter((row) => row.usageLimit === null || (used.get(Number(row.id)) ?? 0) < Number(row.usageLimit));
}

/** Bookings that used each discount, ignoring cancelled ones. */
export async function discountUsage(db: AppDb, ids?: number[]) {
  if (ids && !ids.length) return new Map<number, number>();
  const rows = await db.select({ id: bookings.discountId, uses: count() }).from(bookings)
    .where(and(
      ne(bookings.status, "cancelled"),
      ids ? inArray(bookings.discountId, ids) : sql`${bookings.discountId} is not null`,
    ))
    .groupBy(bookings.discountId);
  return new Map(rows.map((row) => [Number(row.id), Number(row.uses)]));
}
