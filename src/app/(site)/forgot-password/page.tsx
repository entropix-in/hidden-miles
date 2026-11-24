import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountsUnavailable, AuthCard, param } from "@/components/site/auth-card";
import { ForgotPasswordForm } from "@/components/site/auth/forgot-password-form";
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
  const next = safeNext(param(params.next));

  if (await getSessionUser()) redirect(next);

  const configured = accountsConfigured();

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email you booked with and we will send you a link to set a new password."
    >
      {!configured ? <AccountsUnavailable /> : null}
      <ForgotPasswordForm next={next} error={param(params.error)} disabled={!configured} />
    </AuthCard>
  );
}
