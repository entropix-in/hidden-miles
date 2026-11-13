import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { loadDestinations, loadTours } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [destinations, tours] = await Promise.all([
    loadDestinations(),
    loadTours(),
  ]);
  const tourCounts = tours.reduce<Record<string, number>>((counts, tour) => {
    counts[tour.destinationSlug] = (counts[tour.destinationSlug] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <>
      <SiteHeader destinations={destinations} tourCounts={tourCounts} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
