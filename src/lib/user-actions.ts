"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { dbErrorMessage, getDb } from "@/db";
import { users } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/mail";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  applyPasswordReset,
  createPasswordResetToken,
  findPasswordReset,
} from "@/lib/password-reset";
import {
  createUserSession,
  destroyUserSession,
  isValidEmail,
  normalizeEmail,
  requireUser,
  safeNext,
} from "@/lib/user-auth";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
  ).replace(/\/$/, "");
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

function accountUrl(params: { notice?: string; error?: string }) {
  const query = new URLSearchParams();
  if (params.notice) query.set("notice", params.notice);
  if (params.error) query.set("error", params.error);
  const value = query.toString();
  return value ? `/account?${value}` : "/account";
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser("/account");
  const name = getString(formData, "name").slice(0, 120);
  const email = normalizeEmail(getString(formData, "email").slice(0, 190));
  const phone = getString(formData, "phone").slice(0, 40);

  if (name.length < 2) {
    redirect(accountUrl({ error: "Please enter your full name." }));
  }
  if (!isValidEmail(email)) {
    redirect(accountUrl({ error: "Please enter a valid email address." }));
  }

  const db = getDb();
  if (!db) {
    redirect(
      accountUrl({
        error: "Accounts are not available right now. Please try again later.",
      }),
    );
  }

  try {
    await db
      .update(users)
      .set({ name, email, phone })
      .where(eq(users.id, user.id));
  } catch (error) {
    if (isDuplicate(error)) {
      redirect(
        accountUrl({
          error: "That email address is already linked to another account.",
        }),
      );
    }
    console.error(
      "[hidden-miles] failed to update profile",
      dbErrorMessage(error),
    );
    redirect(
      accountUrl({ error: "We could not save your details. Please try again." }),
    );
  }

  redirect(accountUrl({ notice: "Your profile details have been updated." }));
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser("/account");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) {
    redirect(accountUrl({ error: "Enter your current password to make a change." }));
  }
  if (password.length < 8) {
    redirect(accountUrl({ error: "Use at least 8 characters for your new password." }));
  }
  if (password !== confirm) {
    redirect(accountUrl({ error: "Those new passwords do not match." }));
  }

  const db = getDb();
  if (!db) {
    redirect(
      accountUrl({
        error: "Accounts are not available right now. Please try again later.",
      }),
    );
  }

  let valid = false;
  try {
    const [row] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    valid = row ? await verifyPassword(currentPassword, row.passwordHash) : false;
  } catch (error) {
    console.error(
      "[hidden-miles] failed to verify password",
      dbErrorMessage(error),
    );
    redirect(
      accountUrl({ error: "We could not check that password. Please try again." }),
    );
  }

  if (!valid) {
    redirect(accountUrl({ error: "That current password is incorrect." }));
  }

  try {
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(password) })
      .where(eq(users.id, user.id));
  } catch (error) {
    console.error(
      "[hidden-miles] failed to change password",
      dbErrorMessage(error),
    );
    redirect(
      accountUrl({ error: "We could not update your password. Please try again." }),
    );
  }

  redirect(accountUrl({ notice: "Your password has been updated." }));
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = normalizeEmail(getString(formData, "email").slice(0, 190));

  if (!isValidEmail(email)) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "Please enter a valid email address.",
      )}`,
    );
  }

  const db = getDb();
  if (!db) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "Accounts are not available right now. Please try again later.",
      )}`,
    );
  }

  const [user] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Same response whether or not the account exists.
  if (!user) redirect("/forgot-password?sent=1");

  let devLink = "";
  try {
    const token = await createPasswordResetToken(Number(user.id));
    if (token) {
      const next = safeNext(getString(formData, "next"));
      const link = `${siteUrl()}/reset-password?token=${encodeURIComponent(
        token,
      )}${next !== "/account" ? `&next=${encodeURIComponent(next)}` : ""}`;
      const sent = await sendPasswordResetEmail({
        to: email,
        name: user.name,
        url: link,
      });
      if (!sent && process.env.NODE_ENV !== "production") {
        devLink = link;
      }
    }
  } catch (error) {
    console.error(
      "[hidden-miles] failed to issue password reset",
      dbErrorMessage(error),
    );
  }

  redirect(
    devLink
      ? `/forgot-password?sent=1&dev=${encodeURIComponent(devLink)}`
      : "/forgot-password?sent=1",
  );
}

export async function resetPasswordAction(formData: FormData) {
  const token = getString(formData, "token");
  const next = safeNext(getString(formData, "next"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const expiredUrl = `/reset-password?error=${encodeURIComponent(
    "This reset link is invalid or has expired. Request a new one.",
  )}`;

  if (!token) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "Request a new reset link to continue.",
      )}`,
    );
  }

  const target = await findPasswordReset(token);
  if (!target) redirect(expiredUrl);

  const back = (message: string) =>
    `/reset-password?token=${encodeURIComponent(
      token,
    )}&error=${encodeURIComponent(message)}${
      next !== "/account" ? `&next=${encodeURIComponent(next)}` : ""
    }`;

  if (password.length < 8) {
    redirect(back("Use at least 8 characters for your new password."));
  }
  if (password !== confirm) {
    redirect(back("Those passwords do not match."));
  }

  const updated = await applyPasswordReset(token, await hashPassword(password));
  if (!updated) redirect(expiredUrl);

  const loginParams = new URLSearchParams({
    notice: "Your password has been updated. Sign in with your new password.",
    email: updated.email,
  });
  if (next !== "/account") loginParams.set("next", next);

  redirect(`/login?${loginParams.toString()}`);
}
