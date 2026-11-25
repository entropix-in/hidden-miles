import type { Metadata } from "next";
import SiteLayout from "@/app/(site)/layout";
import SiteNotFound from "@/app/(site)/not-found";

// Root title template is "%s · Hidden Miles", so this yields "Page not found · Hidden Miles".
export const metadata: Metadata = {
  title: "Page not found",
};

// Unmatched URLs render outside the (site) route group, so wrap the 404 in the
// site layout to keep the header, nav and footer consistent.
export default function NotFound() {
  return (
    <SiteLayout>
      <SiteNotFound />
    </SiteLayout>
  );
}
