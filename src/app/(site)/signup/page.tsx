import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { AuthCard, AuthError } from "@/components/site/auth-card";
import { signupAction } from "@/lib/user-actions";
import { accountsConfigured, getSessionUser, safeNext } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a Hidden Miles account to book tours and manage your trips.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : undefined);
  const error = typeof params.error === "string" ? params.error : "";
  const email = typeof params.email === "string" ? params.email : "";

  if (await getSessionUser()) redirect(next);

  const configured = accountsConfigured();
  const loginHref = next === "/account" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      eyebrow="Join Hidden Miles"
      title="Create your account"
      subtitle="Takes a minute. Then your next tour is only a few clicks away."
    >
      <AuthError message={error} />

      {!configured ? (
        <div className="mb-5 rounded-[14px] border border-sand-300 bg-sand-100 px-4 py-3 text-sm font-medium text-navy-700">
          Accounts need the MySQL database. Start it with{" "}
          <code className="font-bold">docker compose up -d</code>, then try again.
        </div>
      ) : null}

      <form action={signupAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="As on government ID"
            className="field"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
            <label htmlFor="phone" className="field-label">
              Phone <span className="font-medium text-navy-500">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              autoComplete="tel"
              placeholder="+91"
              className="field"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
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
            Confirm password
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
          <UserPlus className="h-4 w-4" />
          Create my account
        </button>
      </form>

      <p className="mt-4 text-center text-[12px] font-medium leading-5 text-navy-600">
        By continuing you agree to our booking terms and privacy policy. We only
        use your details to plan your trip.
      </p>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-sand-300" />
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
          Already with us?
        </span>
        <span className="h-px flex-1 bg-sand-300" />
      </div>

      <Link href={loginHref} className="btn btn-outline w-full">
        Sign in instead
        <span className="btn-dot">→</span>
      </Link>
    </AuthCard>
  );
}
