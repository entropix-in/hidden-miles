import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingActions } from "@/components/floating-actions";
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
