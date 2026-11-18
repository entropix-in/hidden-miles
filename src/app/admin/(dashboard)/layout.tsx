import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSnackbar } from "@/components/admin/admin-snackbar";
import { Logo } from "@/components/site/logo";
import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";

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

  return (
    <div className="admin-studio admin-dashboard min-h-screen bg-sand-100 lg:grid lg:grid-cols-[216px_minmax(0,1fr)]">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
      <AdminSidebar brand={<Logo light compact />} actions={
        <>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-sand-200/80 transition hover:bg-white/10 hover:text-sand-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View website
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-sand-200/80 transition hover:bg-white/10 hover:text-sand-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </>
      } />

      <div className="min-w-0">
        <main id="admin-main" tabIndex={-1} className="mx-auto max-w-[100rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>

      <Suspense fallback={null}>
        <AdminSnackbar />
      </Suspense>
    </div>
  );
}
