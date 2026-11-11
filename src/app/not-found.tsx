import Link from "next/link";
import { ArrowLeft, Compass, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-sand-100 py-24">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-navy-200/50 blur-3xl" />
      <div className="container-page relative text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-navy-950 text-blue-300">
          <Compass className="h-8 w-8" />
        </span>
        <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.24em] text-blue-700">
          Error 404
        </p>
        <h1 className="mx-auto mt-3 max-w-xl font-display text-4xl font-medium leading-tight text-navy-950 sm:text-5xl">
          Looks like this path is off the map.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-stone-600">
          The page you are looking for may have moved, or perhaps it is still
          waiting to be discovered. Let us get you back to somewhere beautiful.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <Link href="/tours" className="btn-outline">
            <MapPin className="h-4 w-4" />
            Browse journeys
          </Link>
        </div>
      </div>
    </section>
  );
}
