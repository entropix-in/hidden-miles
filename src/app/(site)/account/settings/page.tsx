import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, UserRound } from "lucide-react";
import { logoutAction, changePasswordAction, updateProfileAction } from "@/lib/user-actions";
import { AuthError, AuthNotice } from "@/components/site/auth-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PasswordInput } from "@/components/ui/password-input";
import { requireUser } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";
  const user = await requireUser("/account/settings");

  return (
    <div className="bg-sand-100">
      <div className="container-page pt-8 md:pt-12">
        <Breadcrumbs
          items={[
            { label: "My account", href: "/account" },
            { label: "Account settings" },
          ]}
        />
      </div>

      <div className="container-page py-8 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-label text-gold-600">Account settings</p>
            <h1 className="type-h1 text-[clamp(1.5rem,2.6vw,2.1rem)] mt-1 text-ink">
              Your details &amp; security
            </h1>
            <p className="type-small mt-2 max-w-md text-navy-600">
              Update the details we use for your bookings, or choose a new
              password.
            </p>
          </div>
          <Link href="/account" className="btn btn-outline btn-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to my account
          </Link>
        </div>

        <div className="mt-6 space-y-3 empty:mt-0">
          <AuthNotice message={notice} />
          <AuthError message={error} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="rounded-[24px] border border-sand-300 bg-paper p-6 md:p-7">
            <div className="flex items-start gap-3 border-b border-sand-300 pb-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand-100 text-ink">
                <UserRound className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="type-title text-ink">Personal details</h2>
                <p className="type-small mt-1 text-navy-600">
                  The name, email and phone we use for your bookings.
                </p>
              </div>
            </div>
            <form action={updateProfileAction} className="mt-5 space-y-4">
              <div>
                <label htmlFor="profile-name" className="field-label">
                  Full name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  defaultValue={user.name}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="profile-email" className="field-label">
                  Email address
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  required
                  maxLength={190}
                  autoComplete="email"
                  defaultValue={user.email}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="profile-phone" className="field-label">
                  Phone <span className="font-medium text-navy-500">(optional)</span>
                </label>
                <input
                  id="profile-phone"
                  name="phone"
                  maxLength={40}
                  autoComplete="tel"
                  defaultValue={user.phone}
                  placeholder="+91"
                  className="field"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Save changes
              </button>
            </form>
          </div>

          <div className="rounded-[24px] border border-sand-300 bg-paper p-6 md:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-sand-300 pb-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand-100 text-ink">
                  <LockKeyhole className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="type-title text-ink">Password &amp; security</h2>
                  <p className="type-small mt-1 text-navy-600">
                    Confirm your current password before setting a new one.
                  </p>
                </div>
              </div>
              <Link
                href="/forgot-password"
                className="shrink-0 pt-1 text-xs font-semibold text-blue-700 underline-offset-4 transition hover:text-blue-800 hover:underline"
              >
                Forgot it?
              </Link>
            </div>
            <form action={changePasswordAction} className="mt-5 space-y-4">
              <div>
                <label htmlFor="current-password" className="field-label">
                  Current password
                </label>
                <PasswordInput
                  id="current-password"
                  name="currentPassword"
                  required
                  autoComplete="current-password"
                  placeholder="Your current password"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="field-label">
                  New password
                </label>
                <PasswordInput
                  id="new-password"
                  name="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="field-label">
                  Confirm new password
                </label>
                <PasswordInput
                  id="confirm-password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Type it once more"
                />
              </div>
              <button type="submit" className="btn btn-outline w-full">
                Update password
              </button>
              <p className="text-center text-xs font-medium text-navy-500">
                You&apos;ll stay signed in on this device after changing it.
              </p>
            </form>
          </div>
        </div>

        <section
          aria-labelledby="sign-out"
          className="mt-6 rounded-[24px] border border-sand-300 bg-paper p-6 md:p-7"
        >
          <h2 id="sign-out" className="type-title text-ink">
            Sign out
          </h2>
          <p className="type-small mt-1 text-navy-600">
            Signing out removes this browser&apos;s access to your account. Your
            trips stay safe.
          </p>
          <form action={logoutAction} className="mt-4">
            <button type="submit" className="btn btn-outline">
              Sign out of this device
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
