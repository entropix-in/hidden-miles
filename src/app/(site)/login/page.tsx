import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AccountsUnavailable,
  AuthCard,
  authPageError,
  param,
} from "@/components/site/auth-card";
import { LoginForm } from "@/components/site/auth/login-form";
import { googleConfigured } from "@/lib/auth";
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
  const next = safeNext(param(params.next));

  if (await getSessionUser()) redirect(next);

  const configured = accountsConfigured();

  return (
    <AuthCard
      title="Sign in to book your tour"
      subtitle="Your bookings, traveller details and trip updates live in one account."
    >
      {!configured ? <AccountsUnavailable /> : null}
      <LoginForm
        next={next}
        initialEmail={param(params.email)}
        notice={param(params.notice)}
        error={authPageError(param(params.error))}
        disabled={!configured}
        google={googleConfigured()}
      />
    </AuthCard>
  );
}
