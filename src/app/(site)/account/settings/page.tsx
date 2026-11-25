import type { Metadata } from "next";
import { headers } from "next/headers";
import { AuthNotice, param } from "@/components/site/auth-card";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { SignOutButton } from "@/components/site/account/sign-out-button";
import { VerifyEmailBanner } from "@/components/site/account/verify-email-banner";
import {
  DeleteAccountPanel,
  EmailPanel,
  Panel,
  PasswordPanel,
  ProfilePanel,
  SessionsPanel,
  type DeviceSession,
} from "@/components/site/account/settings-panels";
import { getAuth } from "@/lib/auth";
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
  const notice = notices[param(params.notice)] ?? "";

  return (
    <div className="bg-sand-100">
      <div className="container-page pt-6 md:pt-8">
        <Breadcrumbs
          items={[
            { label: "My account", href: "/account" },
            { label: "Account settings" },
          ]}
        />
      </div>

      <div className="container-page py-8 md:py-10">
        <h1 className="type-h1 text-ink">
          Account settings
        </h1>

        <div className="mt-6 space-y-3 empty:mt-0">
          {notice ? <AuthNotice message={notice} /> : null}
          {!user.emailVerified ? <VerifyEmailBanner email={user.email} /> : null}
        </div>

        <div className="mt-6 rounded-[20px] border border-sand-300 bg-paper p-6 md:p-8">
          <ProfilePanel name={user.name} phone={user.phone} />
          <EmailPanel
            email={user.email}
            emailVerified={user.emailVerified}
            needsApproval={mailConfigured()}
          />
          <PasswordPanel hasPassword={hasPassword} email={user.email} />
          <SessionsPanel sessions={sessions} />
          <Panel title="Sign out">
            <SignOutButton label="Sign out of this device" />
          </Panel>
          <DeleteAccountPanel hasUpcomingTrips={hasUpcomingTrips} hasPassword={hasPassword} />
        </div>
      </div>
    </div>
  );
}
