import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { AuthCard, param } from "@/components/site/auth-card";
import { ResendVerification } from "@/components/site/auth/resend-verification";
import { getSessionUser, safeNext } from "@/lib/user-auth";
import { withNext } from "@/lib/auth-rules";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Landing page for the emailed confirmation link. Better Auth verifies the
 * token at /api/auth/verify-email, signs the traveller in and redirects here
 * (with ?error= when the link is bad or expired).
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNext(param(params.next));
  const error = param(params.error);
  const user = await getSessionUser();

  if (error || !user) {
    return (
      <AuthCard
        title="This link has expired"
        subtitle="Confirmation links work for 24 hours. Send yourself a fresh one below."
      >
        <ResendVerification next={next} initialEmail={user?.email ?? ""} />
        <Link
          href={withNext("/login", next)}
          className="mt-5 inline-flex text-sm font-semibold text-blue-700 transition hover:text-blue-800"
        >
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  const firstName = user.name.split(" ")[0] || "traveller";

  return (
    <AuthCard
      title={`You're all set, ${firstName}`}
      subtitle="Your email is confirmed and you're signed in."
    >
      <div className="rounded-[18px] border border-sand-300 bg-sand-100 p-5" role="status">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold-400">
          <BadgeCheck className="h-5 w-5" aria-hidden />
        </span>
        <p className="type-small mt-4 text-navy-700">
          Trip updates and booking confirmations will go to{" "}
          <span className="font-semibold text-ink">{user.email}</span>.
        </p>
      </div>
      <Link href={next} className="btn btn-primary btn-lg mt-5 w-full">
        {next === "/account" ? "Go to my account" : "Continue"}
        <span className="btn-dot">→</span>
      </Link>
    </AuthCard>
  );
}
