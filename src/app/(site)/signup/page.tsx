import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  AccountsUnavailable,
  AuthCard,
  authPageError,
  param,
} from "@/components/site/auth-card";
import { SignupForm } from "@/components/site/auth/signup-form";
import { googleConfigured } from "@/lib/auth";
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
  const next = safeNext(param(params.next));

  if (await getSessionUser()) redirect(next);

  const configured = accountsConfigured();

  return (
    <AuthCard
      title="Create your account"
      subtitle="Takes a minute. Then your next tour is only a few clicks away."
    >
      {!configured ? <AccountsUnavailable /> : null}
      <SignupForm
        next={next}
        disabled={!configured}
        google={googleConfigured()}
        error={authPageError(param(params.error))}
      />
    </AuthCard>
  );
}
