import Link from "next/link";
import { Contours } from "@/components/site/contours";

export default function SiteNotFound() {
  return (
    <section className="relative isolate overflow-hidden py-24 md:py-36">
      <Contours
        color="rgba(11,39,53,0.12)"
        count={10}
        cx={0.5}
        cy={0.5}
        seed={1.7}
      />
      <div className="container-page relative text-center">
        <p className="type-label text-gold-600">404 · 00.00° N 00.00° E</p>
        <h1 className="type-display mt-5 text-ink">Off the map.</h1>
        <p className="type-lead mx-auto mt-5 max-w-lg text-navy-700">
          This page took a detour. Let&apos;s get you back on route.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-ink btn-lg">
            Back to home
            <span className="btn-dot">→</span>
          </Link>
          <Link href="/tours" className="btn btn-outline btn-lg">
            Browse tours
          </Link>
        </div>
      </div>
    </section>
  );
}
