import { NextResponse } from "next/server";
import {
  dbErrorMessage,
  dbExecute,
  isDbConfigured,
} from "@/lib/db";

export const runtime = "nodejs";

type EnquiryPayload = {
  type?: string;
  name?: string;
  email?: string;
  phone?: string;
  destination?: string;
  travellers?: string;
  month?: string;
  message?: string;
  tour?: string;
  source?: string;
  company?: string;
};

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let payload: EnquiryPayload;

  try {
    payload = (await request.json()) as EnquiryPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const type = clean(payload.type, 32) || "enquiry";
  const name = clean(payload.name, 120);
  const email = clean(payload.email, 190).toLowerCase();
  const phone = clean(payload.phone, 40);

  // Honeypot: silently accept bot submissions without writing anything.
  if (clean(payload.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (type !== "newsletter" && (!name || phone.replace(/\D/g, "").length < 8)) {
    return NextResponse.json(
      { ok: false, error: "Please share your name and a valid phone number." },
      { status: 400 },
    );
  }

  const record = {
    type,
    name: name || "Newsletter subscriber",
    email,
    phone,
    destination: clean(payload.destination, 80) || null,
    travellers: clean(payload.travellers, 20) || null,
    travelMonth: clean(payload.month, 40) || null,
    message: clean(payload.message, 4000) || null,
    tour: clean(payload.tour, 190) || null,
    source: clean(payload.source, 190) || null,
  };

  if (!isDbConfigured()) {
    console.info(
      "[hidden-miles] enquiry received (database not configured)",
      record,
    );
    return NextResponse.json({ ok: true });
  }

  try {
    await dbExecute(
      `INSERT INTO enquiries
        (type, name, email, phone, destination, travellers, travel_month, message, tour, source, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        record.type,
        record.name,
        record.email,
        record.phone,
        record.destination,
        record.travellers,
        record.travelMonth,
        record.message,
        record.tour,
        record.source,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "[hidden-miles] failed to save enquiry to MySQL",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        ok: false,
        error: dbErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
