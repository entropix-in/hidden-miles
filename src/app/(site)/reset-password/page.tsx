import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { AuthCard, AuthError } from "@/components/site/auth-card";
import { findPasswordReset } from "@/lib/password-reset";
import { resetPasswordAction } from "@/lib/user-actions";
import { safeNext } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const next = safeNext(typeof params.next === "string" ? params.next : undefined);
  const error = typeof params.error === "string" ? params.error : "";

  const target = token ? await findPasswordReset(token) : null;
  const loginHref =
    next === "/account" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  if (!target) {
    return (
      <AuthCard
        eyebrow="Account help"
        title="This link has expired"
        subtitle="Reset links are valid for one hour and can only be used once."
      >
        <div className="rounded-[18px] border border-sand-300 bg-sand-100 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold-400">
            <KeyRound className="h-5 w-5" />
          </span>
          <p className="type-small mt-4 text-navy-700">
            Request a fresh link and we will email it to you straight away.
          </p>
        </div>

        <Link
          href={
            next === "/account"
              ? "/forgot-password"
              : `/forgot-password?next=${encodeURIComponent(next)}`
          }
          className="btn btn-primary btn-lg mt-5 w-full"
        >
          Request a new link
          <span className="btn-dot">→</span>
        </Link>
        <Link
          href={loginHref}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 transition hover:text-blue-800"
        >
          Back to sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Account help"
      title="Set a new password"
      subtitle={`Choose a new password for ${target.email}. This will sign you out on every device.`}
    >
      <AuthError message={error} />

      <form action={resetPasswordAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="password" className="field-label">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="field"
          />
          <p className="field-hint">
            Mix letters, numbers and a symbol so it stays yours.
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className="field-label">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Type it once more"
            className="field"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full">
          <KeyRound className="h-4 w-4" />
          Update my password
        </button>
      </form>

      <Link
        href={loginHref}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 transition hover:text-blue-800"
      >
        Back to sign in
        <ArrowRight className="h-4 w-4" />
      </Link>
    </AuthCard>
  );
}
