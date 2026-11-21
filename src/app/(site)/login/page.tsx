import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { AuthCard, AuthError, AuthNotice } from "@/components/site/auth-card";
import { PasswordInput } from "@/components/ui/password-input";
import { loginAction } from "@/lib/user-actions";
import { accountsConfigured, getSessionUser, safeNext } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Hidden Miles account to book a tour and manage your trips.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : undefined);
  const error = typeof params.error === "string" ? params.error : "";
  const notice = typeof params.notice === "string" ? params.notice : "";
  const email = typeof params.email === "string" ? params.email : "";

  if (await getSessionUser()) redirect(next);

  const configured = accountsConfigured();
  const signupHref = next === "/account" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`;
  const forgotHref =
    next === "/account"
      ? "/forgot-password"
      : `/forgot-password?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to book your tour"
      subtitle="Your bookings, traveller details and trip updates live in one account."
    >
      <AuthNotice message={notice} />
      <AuthError message={error} />

      {!configured ? (
        <div className="mb-5 rounded-[14px] border border-sand-300 bg-sand-100 px-4 py-3 text-sm font-medium text-navy-700">
          Accounts need the MySQL database. Start it with{" "}
          <code className="font-bold">docker compose up -d</code>, then try again.
        </div>
      ) : null}

      <form action={loginAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={email}
            placeholder="you@email.com"
            className="field"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <Link
              href={forgotHref}
              className="text-xs font-bold text-blue-700 underline-offset-4 transition hover:text-blue-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full">
          <LockKeyhole className="h-4 w-4" />
          Sign in
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-sand-300" />
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
          New here?
        </span>
        <span className="h-px flex-1 bg-sand-300" />
      </div>

      <Link href={signupHref} className="btn btn-outline w-full">
        Create an account
        <span className="btn-dot">→</span>
      </Link>

      <p className="mt-5 text-center text-[13px] font-medium leading-5 text-navy-600">
        Booking for a group? You can add every traveller&apos;s details after
        you sign in.
      </p>
    </AuthCard>
  );
}
