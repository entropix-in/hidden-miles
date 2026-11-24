import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { AuthNotice, param } from "@/components/site/auth-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { SignOutButton } from "@/components/site/account/sign-out-button";
import { VerifyEmailBanner } from "@/components/site/account/verify-email-banner";
import {
  DeleteAccountPanel,
  EmailPanel,
  GooglePanel,
  PasswordPanel,
  ProfilePanel,
  SessionsPanel,
  type DeviceSession,
} from "@/components/site/account/settings-panels";
import { getAuth, googleConfigured } from "@/lib/auth";
import { loadUserBookings } from "@/lib/content";
import { mailConfigured } from "@/lib/mail";
import { requireUser } from "@/lib/user-auth";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  email: "Your email address has been updated.",
  google: "Google is connected. You can now sign in with it.",
};

const activeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

function describeDevice(userAgent: string | null | undefined) {
  const ua = userAgent ?? "";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "";
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  const device =
    browser && os ? `${browser} on ${os}` : browser || os || "Unknown device";
  return { device, mobile: /Mobi|iPhone|Android/.test(ua) };
}

/** Hide loopback / unknown addresses; they only confuse people. */
function displayIp(ip: string | null | undefined) {
  if (!ip || /^[0:]+$|^::1$|^::ffff:127\.|^127\./.test(ip)) return "";
  return ip.replace(/^::ffff:/, "");
}

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await requireUser("/account/settings");
  const auth = getAuth();
  const requestHeaders = await headers();

  const [current, sessionRows, accounts, bookings] = await Promise.all([
    auth?.api.getSession({ headers: requestHeaders }),
    auth?.api.listSessions({ headers: requestHeaders }).catch(() => []) ?? [],
    auth?.api.listUserAccounts({ headers: requestHeaders }).catch(() => []) ?? [],
    loadUserBookings(user.id),
  ]);

  const sessions: DeviceSession[] = (sessionRows ?? [])
    .map((session) => {
      const isCurrent = session.token === current?.session.token;
      return {
        token: session.token,
        current: isCurrent,
        ...describeDevice(session.userAgent),
        ipAddress: displayIp(session.ipAddress),
        lastActive: isCurrent
          ? "Active now"
          : `Last active ${activeFormatter.format(new Date(session.updatedAt))}`,
      };
    })
    .sort((a, b) => Number(b.current) - Number(a.current));

  const today = new Date().toISOString().slice(0, 10);
  const hasUpcomingTrips = bookings.some(
    (booking) =>
      booking.status !== "cancelled" && (!booking.startDate || booking.startDate >= today),
  );
  const providers = new Set((accounts ?? []).map((account) => account.providerId));
  const hasPassword = providers.has("credential");
  const googleAccount = (accounts ?? []).find((account) => account.providerId === "google");
  const notice = notices[param(params.notice)] ?? "";

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
            <h1 className="type-h1 text-[clamp(1.5rem,2.6vw,2.1rem)] text-ink">
              Your details &amp; security
            </h1>
            <p className="type-small mt-2 max-w-md text-navy-600">
              Update the details we use for your bookings, manage where
              you&apos;re signed in, or choose a new password.
            </p>
          </div>
          <Link href="/account" className="btn btn-outline btn-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to my account
          </Link>
        </div>

        <div className="mt-6 space-y-3 empty:mt-0">
          {notice ? <AuthNotice message={notice} /> : null}
          {!user.emailVerified ? <VerifyEmailBanner email={user.email} /> : null}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="grid gap-6">
            <ProfilePanel name={user.name} phone={user.phone} />
            <EmailPanel
              email={user.email}
              emailVerified={user.emailVerified}
              needsApproval={mailConfigured()}
            />
          </div>
          <div className="grid gap-6">
            <PasswordPanel hasPassword={hasPassword} email={user.email} />
            {googleConfigured() || googleAccount ? (
              <GooglePanel
                accountId={googleAccount?.accountId ?? null}
                canUnlink={hasPassword}
              />
            ) : null}
            <SessionsPanel sessions={sessions} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <section
            aria-labelledby="sign-out"
            className="rounded-[24px] border border-sand-300 bg-paper p-6 md:p-7"
          >
            <h2 id="sign-out" className="type-title text-ink">
              Sign out
            </h2>
            <p className="type-small mt-1 text-navy-600">
              Signing out removes this browser&apos;s access to your account.
              Your trips stay safe.
            </p>
            <SignOutButton className="mt-4" label="Sign out of this device" />
          </section>
          <DeleteAccountPanel hasUpcomingTrips={hasUpcomingTrips} hasPassword={hasPassword} />
        </div>
      </div>
    </div>
  );
}
