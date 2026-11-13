import Link from "next/link";
import { ExternalLink, LogOut, Sparkles } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/site/logo";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getContentStatus } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const status = await getContentStatus();

  return (
    <div className="min-h-screen bg-sand-100 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-navy-950 px-4 py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-6">
        <div className="flex items-center justify-between gap-3">
          <Logo light compact />
        </div>

        <div className="mt-6 lg:mt-9 lg:flex-1">
          <div className="mb-2 hidden items-center justify-between gap-3 px-2 lg:flex">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sand-200/35">
              Manage
            </p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-300">
              Admin
            </span>
          </div>
          <AdminNav />
        </div>

        <div className="mt-5 grid gap-2 border-t border-white/10 pt-4 lg:mt-0">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-sand-200/60 transition hover:bg-white/10 hover:text-sand-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View website
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-sand-200/60 transition hover:bg-white/10 hover:text-sand-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-stone-200 bg-sand-50/90 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.18em] text-stone-500">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Hidden Miles content studio
            </p>
            <div className="flex items-center gap-2">
              <span
                className={
                  status.configured && !status.error
                    ? "inline-flex items-center gap-1.5 rounded-full bg-navy-100 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-navy-800"
                    : "inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-blue-800"
                }
              >
                <span
                  className={
                    status.configured && !status.error
                      ? "h-1.5 w-1.5 rounded-full bg-navy-600"
                      : "h-1.5 w-1.5 rounded-full bg-blue-600"
                  }
                />
                {status.configured && !status.error
                  ? status.seeded
                    ? "MySQL live"
                    : "MySQL ready"
                  : "Database not connected"}
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
