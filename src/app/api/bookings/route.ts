import { NextResponse } from "next/server";
import { and, eq, ne, sum } from "drizzle-orm";
import { dbErrorMessage, getDb } from "@/db";
import { bookings, tourDepartures, tours } from "@/db/schema";
import { getSessionUser } from "@/lib/user-auth";

export const runtime = "nodejs";

type BookingPayload = {
  tourSlug?: string;
  tourTitle?: string;
  departureId?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  travellers?: string | number;
  adults?: string | number;
  children?: string | number;
  infants?: string | number;
  notes?: string;
  company?: string;
};

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let payload: BookingPayload;

  try {
    payload = (await request.json()) as BookingPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 190).toLowerCase();
  const phone = clean(payload.phone, 40);
  const notes = clean(payload.notes, 2000);
  const tourSlug = clean(payload.tourSlug, 190);
  const tourTitle = clean(payload.tourTitle, 190);
  const rawTravellers = Math.min(
    20,
    Math.max(1, Number(payload.travellers) || 1),
  );
  const hasTravellerBreakdown =
    payload.adults !== undefined ||
    payload.children !== undefined ||
    payload.infants !== undefined;
  const adults = hasTravellerBreakdown
    ? Math.min(20, Math.max(1, Number(payload.adults) || 1))
    : rawTravellers;
  const children = hasTravellerBreakdown
    ? Math.min(20, Math.max(0, Number(payload.children) || 0))
    : 0;
  const infants = hasTravellerBreakdown
    ? Math.min(20, Math.max(0, Number(payload.infants) || 0))
    : 0;
  const travellers = hasTravellerBreakdown
    ? Math.min(60, adults + children + infants)
    : rawTravellers;

  // Honeypot: silently accept bot submissions without writing anything.
  if (clean(payload.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        requiresAuth: true,
        error: "Please sign in to book your tour.",
      },
      { status: 401 },
    );
  }

  const leadName = name || user.name;
  const leadEmail = email || user.email;
  const leadPhone = phone || user.phone;

  if (!tourSlug) {
    return NextResponse.json(
      { ok: false, error: "Tour package is missing." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!leadName || leadPhone.replace(/\D/g, "").length < 8) {
    return NextResponse.json(
      { ok: false, error: "Please share your name and a valid phone number." },
      { status: 400 },
    );
  }

  const db = getDb();
  if (!db) {
    console.info("[hidden-miles] booking request received (database not configured)", {
      tourSlug,
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      travellers,
    });
    return NextResponse.json(
      {
        ok: false,
        error:
          "Online booking is not available right now. Please call us to reserve your seats.",
      },
      { status: 503 },
    );
  }

  try {
    const [tour] = await db
      .select({ price: tours.price, childPrice: tours.childPrice, infantPrice: tours.infantPrice })
      .from(tours)
      .where(eq(tours.slug, tourSlug))
      .limit(1);
    let departureId: number | null = null;
    let startDate: string | null = null;
    let adultFare = Number(tour?.price ?? 0);

    const rawDepartureId = Number(payload.departureId);
    if (Number.isInteger(rawDepartureId) && rawDepartureId > 0) {
      const [departure] = await db
        .select()
        .from(tourDepartures)
        .where(
          and(
            eq(tourDepartures.id, rawDepartureId),
            eq(tourDepartures.tourSlug, tourSlug),
          ),
        )
        .limit(1);

      if (!departure) {
        return NextResponse.json(
          { ok: false, error: "That departure is no longer available." },
          { status: 404 },
        );
      }

      const [booked] = await db
        .select({ travellers: sum(bookings.travellers) })
        .from(bookings)
        .where(
          and(
            eq(bookings.departureId, rawDepartureId),
            ne(bookings.status, "cancelled"),
          ),
        );

      const seatsLeft = Number(departure.capacity) - Number(booked?.travellers ?? 0);
      if (seatsLeft < travellers) {
        return NextResponse.json(
          {
            ok: false,
            error:
              seatsLeft > 0
                ? `Only ${seatsLeft} ${
                    seatsLeft === 1 ? "seat is" : "seats are"
                  } left on this date.`
                : "This departure is sold out. Please pick another date.",
          },
          { status: 409 },
        );
      }

      departureId = Number(departure.id);
      startDate = String(departure.startDate);
      adultFare = Number(departure.price);
    }

    const childFare =
      tour?.childPrice === null || tour?.childPrice === undefined
        ? Math.round(adultFare * 0.75)
        : Number(tour.childPrice);
    const infantFare = Number(tour?.infantPrice ?? 0);
    const amount = Math.round(
      adultFare * adults + childFare * children + infantFare * infants,
    );

    await db.insert(bookings).values({
      departureId,
      userId: user.id,
      tourSlug,
      tourTitle,
      startDate,
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      travellers,
      amount,
      notes: notes || null,
      status: "pending",
    });

    return NextResponse.json({ ok: true, amount });
  } catch (error) {
    console.error(
      "[hidden-miles] failed to save booking to MySQL",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { ok: false, error: dbErrorMessage(error) },
      { status: 500 },
    );
  }
}
