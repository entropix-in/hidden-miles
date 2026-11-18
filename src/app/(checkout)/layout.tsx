import SiteLayout from "@/app/(site)/layout";

// Checkout shares the site header, nav and footer so it feels like the same site.
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
