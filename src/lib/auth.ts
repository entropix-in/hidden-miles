import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { getDb, type AppDb } from "@/db";
import {
  authAccounts,
  authRateLimits,
  authSessions,
  authVerifications,
  bookings,
  users,
} from "@/db/schema";
import {
  mailConfigured,
  sendChangeEmailConfirmation,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/mail";
import { hashPassword, verifyPassword } from "@/lib/password";
import { nameProblem, passwordProblem, phoneProblem } from "@/lib/auth-rules";

const DAY = 60 * 60 * 24;

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Origins allowed to call /api/auth. Localhost is added in development. */
function trustedOrigins() {
  const extra = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const dev =
    process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:3000", "http://127.0.0.1:3000"];
  return [siteUrl(), ...extra, ...dev];
}

/** Google sign-in turns on once both credentials are set. */
export function googleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

function reject(message: string): never {
  throw new APIError("BAD_REQUEST", { message });
}

function createAuth(db: AppDb) {
  // Without an email provider nobody could ever confirm an address, so only
  // insist on verification when Resend is set up. Links are logged otherwise.
  const requireVerification = mailConfigured();

  return betterAuth({
    appName: "Hidden Miles",
    baseURL: siteUrl(),
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: trustedOrigins(),
    database: drizzleAdapter(db, {
      provider: "mysql",
      schema: {
        users,
        auth_sessions: authSessions,
        auth_accounts: authAccounts,
        auth_verifications: authVerifications,
        auth_rate_limits: authRateLimits,
      },
    }),
    advanced: {
      cookiePrefix: "hiddenmiles",
      // Numeric ids keep bookings.user_id and existing accounts intact.
      database: { generateId: "serial" },
    },

    user: {
      modelName: "users",
      additionalFields: {
        phone: { type: "string", required: false, defaultValue: "", input: true },
      },
      changeEmail: {
        enabled: true,
        updateEmailWithoutVerification: !requireVerification,
        async sendChangeEmailConfirmation({ user, newEmail, url }) {
          await sendChangeEmailConfirmation({
            to: user.email,
            name: user.name,
            url,
            newEmail,
          });
        },
      },
      deleteUser: {
        enabled: true,
        // Keep booking records for the office, but detach them from the account.
        async beforeDelete(user) {
          await db
            .update(bookings)
            .set({ userId: null })
            .where(eq(bookings.userId, Number(user.id)));
        },
      },
    },
    session: {
      modelName: "auth_sessions",
      expiresIn: 30 * DAY,
      updateAge: DAY,
    },
    account: {
      modelName: "auth_accounts",
      // Google confirms the email, so a Google sign-in with the same address
      // joins the existing account instead of failing.
      accountLinking: { enabled: true, trustedProviders: ["google"] },
    },
    socialProviders: googleConfigured()
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
            prompt: "select_account",
          },
        }
      : {},
    verification: { modelName: "auth_verifications" },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: requireVerification,
      autoSignIn: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      // Same scrypt format as before, so existing passwords keep working.
      password: {
        hash: hashPassword,
        verify: ({ hash, password }) => verifyPassword(password, hash),
      },
      async sendResetPassword({ user, url }) {
        await sendPasswordResetEmail({ to: user.email, name: user.name, url });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: DAY,
      async sendVerificationEmail({ user, url }) {
        await sendVerificationEmail({ to: user.email, name: user.name, url });
      },
    },

    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "auth_rate_limits",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60 * 10, max: 5 },
        "/request-password-reset": { window: 60 * 10, max: 3 },
        "/send-verification-email": { window: 60 * 10, max: 3 },
        "/change-password": { window: 60, max: 5 },
        "/change-email": { window: 60 * 10, max: 3 },
        "/delete-user": { window: 60, max: 3 },
        "/sign-in/social": { window: 60, max: 10 },
      },
    },

    // Server-side rules the browser can't skip.
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        const body = (ctx.body ?? {}) as Record<string, unknown>;
        const text = (key: string) =>
          typeof body[key] === "string" ? (body[key] as string) : undefined;

        if (ctx.path === "/sign-up/email" || ctx.path === "/update-user") {
          const name = text("name");
          if (name !== undefined) {
            const problem = nameProblem(name);
            if (problem) reject(problem);
          }
          const phone = text("phone");
          if (phone !== undefined) {
            const problem = phoneProblem(phone);
            if (problem) reject(problem);
          }
        }

        const newPassword =
          ctx.path === "/sign-up/email"
            ? text("password")
            : ctx.path === "/reset-password" || ctx.path === "/change-password"
              ? text("newPassword")
              : undefined;
        if (newPassword !== undefined) {
          const problem = passwordProblem(newPassword);
          if (problem) reject(problem);
        }
      }),
    },

    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;

// Module-level (not globalThis) so config edits apply on hot reload.
// The MySQL pool itself is shared through getDb().
let instance: Auth | undefined;

/** Better Auth needs MySQL; returns null when the database isn't configured. */
export function getAuth(): Auth | null {
  if (instance) return instance;
  const db = getDb();
  if (!db) return null;
  instance = createAuth(db);
  return instance;
}
