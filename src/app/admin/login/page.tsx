import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, LockKeyhole } from "lucide-react";
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
    <div className="admin-studio grid min-h-screen place-items-center px-4 py-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to website
          </Link>

          <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="admin-page-title">Sign in to Hidden Miles</h1>

            {error ? (
              <div role="alert" className="mt-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
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

        </div>
    </div>
  );
}
