"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
});

/** Turn a Better Auth error into a sentence a traveller can act on. */
export function authErrorMessage(
  error: { code?: string; message?: string; status?: number } | null | undefined,
  fallback = "Something went wrong. Please try again.",
) {
  if (!error) return fallback;
  if (error.status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Incorrect email or password. Please try again.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Try signing in instead.";
    case "EMAIL_NOT_VERIFIED":
      return "Please confirm your email first. We have sent you a fresh link.";
    case "INVALID_PASSWORD":
      return "That current password is incorrect.";
    case "INVALID_TOKEN":
      return "This link is invalid or has expired. Request a new one.";
    case "SESSION_EXPIRED":
      return "For your security, please sign in again to make this change.";
    case "PASSWORD_TOO_SHORT":
      return "Use at least 8 characters for your password.";
    case "PASSWORD_TOO_LONG":
      return "Use 128 characters or fewer for your password.";
  }
  return error.message || fallback;
}
