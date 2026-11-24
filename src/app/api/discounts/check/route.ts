import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { availableDiscounts, normalizeCode, toDiscountRule } from "@/lib/discounts";

export const runtime = "nodejs";

/** Looks up a promo code for a package. The bookings API re-checks it on submit. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { tourSlug?: unknown; code?: unknown };
  const code = normalizeCode(body.code);
  const tourSlug = typeof body.tourSlug === "string" ? body.tourSlug.trim().slice(0, 190) : "";
  if (!code || !tourSlug) {
    return NextResponse.json({ ok: false, error: "Enter a promo code." }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "Promo codes are unavailable right now." }, { status: 503 });

  try {
    const match = (await availableDiscounts(db, tourSlug, code)).find((row) => row.code === code);
    if (!match) {
      return NextResponse.json({ ok: false, error: "That code isn't valid for this tour." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, discount: toDiscountRule(match) });
  } catch (error) {
    console.error("[hidden-miles] promo code check failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We couldn't check that code. Try again." }, { status: 500 });
  }
}
