import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { adminConfigured, hasAdminSession } from "@/lib/admin-auth";
import { loginAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await hasAdminSession()) redirect("/admin");

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const configured = adminConfigured();

  return (
    <div className="grid min-h-screen bg-navy-950 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-navy-400/15 blur-3xl" />
        <Logo light className="relative" />
        <div className="relative max-w-md">
          <p className="eyebrow text-blue-300">Hidden Miles admin</p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] text-sand-50">
            Your journeys,
            <br />
            managed beautifully.
          </h1>
          <p className="mt-5 text-sm leading-7 text-sand-200/65">
            Create packages, destinations and experiences, keep an eye on
            enquiries, and publish updates to the site in seconds — all powered
            by MySQL.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-sand-200/40">
          <ShieldCheck className="h-4 w-4 text-blue-300" />
          Private admin area
        </p>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-sand-50 px-5 py-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-stone-400 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to website
          </Link>

          <div className="mt-8 rounded-[32px] border border-stone-200 bg-white p-7 shadow-2xl shadow-navy-950/10 sm:p-9">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
              <LockKeyhole className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold text-navy-950">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Enter your admin password to manage the site.
            </p>

            {error ? (
              <div className="mt-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

            {!configured ? (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-5 text-blue-900">
                Set <code className="font-bold">ADMIN_PASSWORD</code> and{" "}
                <code className="font-bold">ADMIN_SESSION_SECRET</code> in your
                environment to enable admin login.
              </div>
            ) : null}

            <form action={loginAction} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="field-label">
                  Admin password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="field"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                <LockKeyhole className="h-4 w-4" />
                Sign in to admin
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm font-semibold text-stone-400">
            Hidden Miles Holidays · Content Studio
          </p>
        </div>
      </div>
    </div>
  );
}
