import { Suspense } from "react";
import Link from "next/link";
import { Compass, ExternalLink, LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSnackbar } from "@/components/admin/admin-snackbar";
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
    <div className="admin-studio admin-dashboard min-h-screen lg:grid lg:grid-cols-[208px_minmax(0,1fr)]">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
      <AdminSidebar brand={<Link className="admin-brand" href="/admin"><span><Compass size={19} aria-hidden /></span> Hidden Miles</Link>} actions={
        <>
          <Link
            href="/"
            className="admin-nav-link"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View website
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="admin-nav-link w-full"
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
