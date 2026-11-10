import { NextResponse } from "next/server";
import { dbErrorMessage, getDb } from "@/db";
import { enquiries } from "@/db/schema";

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

  const db = getDb();
  if (!db) {
    console.info(
      "[hidden-miles] enquiry received (database not configured)",
      record,
    );
    return NextResponse.json({ ok: true });
  }

  try {
    await db.insert(enquiries).values({
      type: record.type,
      name: record.name,
      email: record.email,
      phone: record.phone,
      destination: record.destination,
      travellers: record.travellers,
      travelMonth: record.travelMonth,
      message: record.message,
      tour: record.tour,
      source: record.source,
      status: "new",
    });

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
