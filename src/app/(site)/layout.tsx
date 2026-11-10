import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { FloatingActions } from "@/components/site/floating-actions";
import { loadDestinations } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const destinations = await loadDestinations();

  return (
    <>
      <SiteHeader destinations={destinations} />
      <main>{children}</main>
      <SiteFooter destinations={destinations} />
      <FloatingActions />
    </>
  );
}
