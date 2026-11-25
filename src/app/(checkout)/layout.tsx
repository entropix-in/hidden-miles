import { Lock, Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { site } from "@/data/site";

// Checkout is a focused flow: brand + help line only, no site nav or footer
// to pull travellers away mid-booking.
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-sand-300/80 bg-paper">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <Logo compact />
          <div className="flex items-center gap-5 text-sm font-medium text-ink/70">
            <span className="hidden items-center gap-1.5 sm:flex">
              <Lock className="h-3.5 w-3.5" />
              Secure booking
            </span>
            <a
              href={site.phoneHref}
              className="flex items-center gap-1.5 transition hover:text-ink"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{site.phone}</span>
              <span className="sm:hidden">Call us</span>
            </a>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
