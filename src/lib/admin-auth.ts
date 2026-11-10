import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "hiddenmiles_admin";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || "";
}

export function adminConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD?.trim() && process.env.ADMIN_SESSION_SECRET?.trim(),
  );
}

export function isAdminPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD?.trim() || "";
  if (!expected) return false;

  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function createToken() {
  const payload = `v1.${Date.now() + SESSION_DURATION_MS}`;
  return `${payload}.${sign(payload)}`;
}

function isValidToken(token: string) {
  const secret = sessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [version, expiry, signature] = parts;
  if (version !== "v1") return false;

  const payload = `${version}.${expiry}`;
  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  const expiryTime = Number(expiry);
  return Number.isFinite(expiryTime) && expiryTime > Date.now();
}

export async function createAdminSession() {
  if (!adminConfigured()) {
    throw new Error("Admin credentials are not configured.");
  }

  const store = await cookies();
  store.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function hasAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  return isValidToken(token);
}

export async function requireAdmin() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }
}
