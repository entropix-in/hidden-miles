/**
 * Account field rules shared by the forms (instant feedback) and the
 * Better Auth hooks (enforcement). Each returns an error message or "".
 */

export const PASSWORD_HINT = "At least 8 characters, with a letter and a number.";

export function passwordProblem(password: string) {
  if (password.length < 8) return "Use at least 8 characters for your password.";
  if (password.length > 128) return "Use 128 characters or fewer for your password.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Include at least one letter and one number in your password.";
  }
  return "";
}

/** 0–4, for the strength meter only. */
export function passwordScore(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || /[a-z].*[A-Z]|[A-Z].*[a-z]/.test(password)) score++;
  return passwordProblem(password) ? Math.min(score, 1) : score;
}

export function nameProblem(name: string) {
  const value = name.trim();
  if (value.length < 2) return "Please enter your full name.";
  if (value.length > 120) return "Please keep your name under 120 characters.";
  return "";
}

/** Phone is optional; when given it must look like a real number. */
export function phoneProblem(phone: string) {
  const value = phone.trim();
  if (!value) return "";
  if (!/^\+?[\d\s()-]{7,20}$/.test(value) || value.replace(/\D/g, "").length < 7) {
    return "Enter a valid phone number, for example +91 98204 12345.";
  }
  return "";
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Only allow same-site paths as a post-login destination. */
export function safeNext(value: string | null | undefined, fallback = "/account") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  if (
    ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"].some(
      (path) => value.startsWith(path),
    )
  ) {
    return fallback;
  }
  return value;
}

/** Append ?next= only when it differs from the default. */
export function withNext(path: string, next: string) {
  return next === "/account" ? path : `${path}?next=${encodeURIComponent(next)}`;
}
