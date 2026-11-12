import { NextResponse } from "next/server";
import { and, eq, ne, sum } from "drizzle-orm";
import { dbErrorMessage, getDb } from "@/db";
import { bookings, tourDepartures } from "@/db/schema";

export const runtime = "nodejs";

type BookingPayload = {
  tourSlug?: string;
  tourTitle?: string;
  departureId?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  travellers?: string | number;
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
  const travellers = Math.min(
    20,
    Math.max(1, Number(payload.travellers) || 1),
  );

  // Honeypot: silently accept bot submissions without writing anything.
  if (clean(payload.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  if (!tourSlug) {
    return NextResponse.json(
      { ok: false, error: "Tour package is missing." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!name || phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json(
      { ok: false, error: "Please share your name and a valid phone number." },
      { status: 400 },
    );
  }

  const db = getDb();
  if (!db) {
    console.info("[hidden-miles] booking request received (database not configured)", {
      tourSlug,
      name,
      email,
      phone,
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
    let departureId: number | null = null;
    let startDate: string | null = null;
    let amount = 0;

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
      amount = Number(departure.price) * travellers;
    }

    await db.insert(bookings).values({
      departureId,
      tourSlug,
      tourTitle,
      startDate,
      name,
      email,
      phone,
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
