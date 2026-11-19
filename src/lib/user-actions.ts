"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { dbErrorMessage, getDb } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createUserSession,
  destroyUserSession,
  isValidEmail,
  normalizeEmail,
  safeNext,
} from "@/lib/user-auth";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function authUrl(
  path: "/login" | "/signup",
  next: string,
  error?: string,
  email?: string,
) {
  const params = new URLSearchParams();
  if (next !== "/account") params.set("next", next);
  if (error) params.set("error", error);
  if (email) params.set("email", email);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function isDuplicate(error: unknown) {
  const candidate = error as {
    code?: string;
    cause?: { code?: string };
  };
  return (
    candidate.code === "ER_DUP_ENTRY" ||
    candidate.cause?.code === "ER_DUP_ENTRY"
  );
}

export async function signupAction(formData: FormData) {
  const name = getString(formData, "name").slice(0, 120);
  const email = normalizeEmail(getString(formData, "email").slice(0, 190));
  const phone = getString(formData, "phone").slice(0, 40);
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const next = safeNext(getString(formData, "next"));

  if (name.length < 2) {
    redirect(authUrl("/signup", next, "Please enter your full name.", email));
  }
  if (!isValidEmail(email)) {
    redirect(authUrl("/signup", next, "Please enter a valid email address.", email));
  }
  if (password.length < 8) {
    redirect(
      authUrl("/signup", next, "Use at least 8 characters for your password.", email),
    );
  }
  if (password !== confirm) {
    redirect(authUrl("/signup", next, "Those passwords do not match.", email));
  }

  const db = getDb();
  if (!db) {
    redirect(
      authUrl(
        "/signup",
        next,
        "Accounts are not available right now. Please try again later.",
        email,
      ),
    );
  }

  let userId: number;
  try {
    const [result] = await db.insert(users).values({
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
    });
    userId = Number(result.insertId);
  } catch (error) {
    if (isDuplicate(error)) {
      redirect(
        authUrl(
          "/signup",
          next,
          "An account with this email already exists. Try signing in instead.",
          email,
        ),
      );
    }
    console.error("[hidden-miles] failed to create account", dbErrorMessage(error));
    redirect(
      authUrl(
        "/signup",
        next,
        "We could not create your account. Please try again.",
        email,
      ),
    );
  }

  await createUserSession(userId);
  redirect(next);
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(getString(formData, "email").slice(0, 190));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(getString(formData, "next"));

  if (!isValidEmail(email) || !password) {
    redirect(authUrl("/login", next, "Enter your email and password.", email));
  }

  const db = getDb();
  if (!db) {
    redirect(
      authUrl(
        "/login",
        next,
        "Accounts are not available right now. Please try again later.",
        email,
      ),
    );
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) {
    redirect(
      authUrl("/login", next, "Incorrect email or password. Please try again.", email),
    );
  }

  await createUserSession(Number(user.id));
  redirect(next);
}

export async function logoutAction() {
  await destroyUserSession();
  redirect("/");
}
