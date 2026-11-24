import type { Metadata } from "next";
import { AuthCard, param } from "@/components/site/auth-card";
import {
  ExpiredResetLink,
  ResetPasswordForm,
} from "@/components/site/auth/reset-password-form";
import { safeNext } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Better Auth checks the emailed link at /api/auth/reset-password/:token and
 * sends the traveller here with ?token= (valid) or ?error=INVALID_TOKEN.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = param(params.token);
  const next = safeNext(param(params.next));

  if (!token || params.error) {
    return (
      <AuthCard
        title="This link has expired"
        subtitle="Reset links are valid for one hour and can only be used once."
      >
        <ExpiredResetLink next={next} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a new password for your Hidden Miles account."
    >
      <ResetPasswordForm token={token} next={next} />
    </AuthCard>
  );
}
