import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { userSessions, users } from "@/db/schema";

export const USER_COOKIE = "hiddenmiles_user";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
};

export function accountsConfigured() {
  return Boolean(getDb());
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Only allow same-site paths as a post-login destination. */
export function safeNext(value: string | null | undefined, fallback = "/account") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/signup")) return fallback;
  return value;
}

function tokenId(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(userId: number) {
  const db = getDb();
  if (!db) throw new Error("Accounts are not available right now.");

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(userSessions).values({
    id: tokenId(token),
    userId,
    expiresAt,
  });

  // Opportunistic cleanup keeps the table from growing forever.
  await db
    .delete(userSessions)
    .where(lt(userSessions.expiresAt, new Date()))
    .catch(() => undefined);

  const store = await cookies();
  store.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function destroyUserSession() {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  store.delete(USER_COOKIE);

  if (!token) return;
  const db = getDb();
  if (!db) return;
  await db
    .delete(userSessions)
    .where(eq(userSessions.id, tokenId(token)))
    .catch(() => undefined);
}

/**
 * Resolve the signed-in traveller for this request.
 * Cached per request so multiple server components share one lookup.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const db = getDb();
  if (!db) return null;

  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return null;

  try {
    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
      })
      .from(userSessions)
      .innerJoin(users, eq(users.id, userSessions.userId))
      .where(
        and(
          eq(userSessions.id, tokenId(token)),
          gt(userSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!row) return null;

    return {
      id: Number(row.id),
      name: row.name,
      email: row.email,
      phone: row.phone,
      createdAt: row.createdAt,
    };
  } catch {
    return null;
  }
});

/** Send guests to sign in, then back to where they were headed. */
export async function requireUser(nextPath = "/account") {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeNext(nextPath))}`);
  }
  return user;
}
