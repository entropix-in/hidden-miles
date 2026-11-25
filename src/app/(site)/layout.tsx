import { ViewTransition } from "react";
import { ScrollToTop } from "@/components/site/scroll-to-top";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { loadDestinations, loadTours } from "@/lib/content";
import { getSessionUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [destinations, tours, user] = await Promise.all([
    loadDestinations(),
    loadTours(),
    getSessionUser(),
  ]);
  const tourCounts = tours.reduce<Record<string, number>>((counts, tour) => {
    counts[tour.destinationSlug] = (counts[tour.destinationSlug] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <>
      <SiteHeader
        destinations={destinations}
        tourCounts={tourCounts}
        user={user}
      />
      {/* Route changes crossfade + rise the page body; header/footer stay put. */}
      <ScrollToTop />
      <ViewTransition default="page">
        <main>{children}</main>
      </ViewTransition>
      <SiteFooter />
    </>
  );
}
