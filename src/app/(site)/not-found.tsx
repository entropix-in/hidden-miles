import Link from "next/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Contours } from "@/components/site/contours";

export default function SiteNotFound() {
  return (
    <section className="relative isolate overflow-hidden pt-8 pb-20 md:pt-12 md:pb-28">
      <Contours
        color="rgba(11,39,53,0.12)"
        count={10}
        cx={0.5}
        cy={0.5}
        seed={1.7}
      />
      <div className="container-page relative">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Page not found" }]} />
        <h1 className="type-h1 mt-5 text-ink">Off the map.</h1>
        <p className="type-lead mt-4 max-w-lg text-navy-700">
          This page took a detour. Let&apos;s get you back on route.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-ink">
            Back to home
            <span className="btn-dot">→</span>
          </Link>
          <Link href="/tours" className="btn btn-outline">
            Browse tours
          </Link>
        </div>
      </div>
    </section>
  );
}
