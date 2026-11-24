import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MailCheck } from "lucide-react";
import { AuthCard, AuthError } from "@/components/site/auth-card";
import { requestPasswordResetAction } from "@/lib/user-actions";
import { accountsConfigured, getSessionUser, safeNext } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : undefined);
  const error = typeof params.error === "string" ? params.error : "";
  const sent = params.sent === "1";
  const devLink =
    process.env.NODE_ENV !== "production" && typeof params.dev === "string"
      ? params.dev
      : "";

  if (await getSessionUser()) redirect(next);

  const loginHref =
    next === "/account" ? "/login" : `/login?next=${encodeURIComponent(next)}`;
  const configured = accountsConfigured();

  return (
    <AuthCard
      eyebrow="Account help"
      title="Forgot your password?"
      subtitle="Enter the email you booked with and we will send you a link to set a new password."
    >
      {sent ? (
        <div>
          <div className="rounded-[18px] border border-sand-300 bg-sand-100 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold-400">
              <MailCheck className="h-5 w-5" />
            </span>
            <h2 className="type-h4 mt-4 text-ink">Check your inbox</h2>
            <p className="type-small mt-2 text-navy-700">
              If an account exists for that email, a reset link is on its way.
              The link works for one hour and can be used once.
            </p>
            <p className="mt-3 text-[13px] font-medium text-navy-600">
              Nothing arrived? Check spam, then{" "}
              <Link
                href={loginHref}
                className="font-semibold text-blue-700 hover:text-blue-800"
              >
                try again
              </Link>
              .
            </p>
          </div>

          {devLink ? (
            <div className="mt-4 rounded-[16px] border border-dashed border-gold-300 bg-gold-50 p-4">
              <p className="text-[11px] font-semibold text-gold-700">
                Development only · email not configured
              </p>
              <a
                href={devLink}
                className="mt-2 block break-all text-[13px] font-semibold text-blue-700 underline-offset-4 hover:underline"
              >
                {devLink}
              </a>
              <p className="mt-2 text-[12px] font-medium leading-5 text-navy-600">
                Set <code className="font-semibold">RESEND_API_KEY</code> and{" "}
                <code className="font-semibold">EMAIL_FROM</code> to send real
                emails.
              </p>
            </div>
          ) : null}

          <Link href={loginHref} className="btn btn-primary btn-lg mt-5 w-full">
            Back to sign in
            <span className="btn-dot">→</span>
          </Link>
        </div>
      ) : (
        <>
          <AuthError message={error} />

          {!configured ? (
            <div className="mb-5 rounded-[14px] border border-sand-300 bg-sand-100 px-4 py-3 text-sm font-medium text-navy-700">
              Accounts need the MySQL database. Start it with{" "}
              <code className="font-semibold">docker compose up -d</code>, then try
              again.
            </div>
          ) : null}

          <form action={requestPasswordResetAction} className="space-y-4">
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
                placeholder="you@email.com"
                className="field"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              Send reset link
              <span className="btn-dot">→</span>
            </button>
          </form>

          <Link
            href={loginHref}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
          >
            Back to sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </AuthCard>
  );
}
