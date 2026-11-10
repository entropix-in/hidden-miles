import { NextResponse } from "next/server";
import mysql, { type Pool } from "mysql2/promise";

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

const globalForDb = globalThis as unknown as { safarnestPool?: Pool };

function getPool(): Pool | null {
  if (!process.env.DB_HOST) return null;
  if (globalForDb.safarnestPool) return globalForDb.safarnestPool;

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME ?? "safarnest",
    user: process.env.DB_USER ?? "safarnest",
    password: process.env.DB_PASSWORD ?? "",
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 5000,
  });

  globalForDb.safarnestPool = pool;
  return pool;
}

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
    destination: clean(payload.destination, 80),
    travellers: clean(payload.travellers, 20),
    travel_month: clean(payload.month, 40),
    message: clean(payload.message, 4000),
    tour: clean(payload.tour, 190),
    source: clean(payload.source, 190),
  };

  const pool = getPool();

  if (!pool) {
    console.info("[safarnest] enquiry received (no database configured)", record);
    return NextResponse.json({ ok: true });
  }

  try {
    await pool.execute(
      `INSERT INTO enquiries
        (type, name, email, phone, destination, travellers, travel_month, message, tour, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.type,
        record.name,
        record.email,
        record.phone,
        record.destination,
        record.travellers,
        record.travel_month,
        record.message,
        record.tour,
        record.source,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "[safarnest] failed to save enquiry",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { ok: false, error: "We could not save your enquiry. Please call us." },
      { status: 500 },
    );
  }
}
