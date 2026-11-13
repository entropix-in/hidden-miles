import type { Metadata } from "next";
import Link from "next/link";
import { Check, Heart, Phone, Sparkles, Star } from "lucide-react";
import { DestinationCard } from "@/components/site/destination-card";
import { FeatureTile } from "@/components/site/feature-tile";
import { Kicker } from "@/components/site/section-heading";
import { Stamp } from "@/components/site/stamp";
import { TourCard } from "@/components/site/tour-card";
import { loadDestinations, loadTours } from "@/lib/content";

export const metadata: Metadata = {
  title: "Design System v2.0",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const colours = [
  { name: "Ink · navy-950", hex: "#0B2735", use: "Text, dark sections", className: "bg-ink" },
  { name: "Navy-700", hex: "#265A6D", use: "Secondary text", className: "bg-navy-700" },
  { name: "Navy-500", hex: "#36879F", use: "Meta, labels", className: "bg-navy-500" },
  { name: "Paper · sand-50", hex: "#FFFFFF", use: "Page background", className: "bg-paper" },
  { name: "Sand-100", hex: "#FAF8F3", use: "Alt sections", className: "bg-sand-100" },
  { name: "Sand-200", hex: "#F3EEE2", use: "Chips, icon wells", className: "bg-sand-200" },
  { name: "Sand-300", hex: "#EAE2CF", use: "Borders, route lines", className: "bg-sand-300" },
  { name: "Gold-400", hex: "#DDB02A", use: "Primary action, accent", className: "bg-gold-400" },
  { name: "Gold-600", hex: "#A87612", use: "Accent text on paper", className: "bg-gold-600" },
  { name: "Blue-500", hex: "#2698BD", use: "Info", className: "bg-blue-500" },
  { name: "Blue-700", hex: "#196785", use: "Links", className: "bg-blue-700" },
  { name: "Success", hex: "#1C7A55", use: "Availability", className: "bg-success" },
];

const typeSamples = [
  { role: "display", meta: "Fraunces Regular · 84/88", sample: "Journeys that stay", className: "type-display" },
  { role: "h1", meta: "Fraunces Regular · 64/70", sample: "Every departure, in one place", className: "type-h1" },
  { role: "h2", meta: "Fraunces Regular · 48/56", sample: "Where will you wander next?", className: "type-h2" },
  { role: "h3", meta: "Fraunces Regular · 32/40", sample: "Day by day", className: "type-h3" },
  { role: "h4", meta: "Fraunces Medium · 24/32", sample: "Magical Kashmir", className: "type-h4" },
  { role: "title", meta: "Manrope Bold · 18/26", sample: "Honest, all-inclusive prices", className: "type-title" },
  { role: "lead", meta: "Manrope Regular · 19/32", sample: "Thoughtfully planned trips across India and the world.", className: "type-lead" },
  { role: "body", meta: "Manrope Regular · 16/27", sample: "Float across Dal Lake at sunrise and ride the Gulmarg gondola.", className: "type-body" },
  { role: "small", meta: "Manrope Medium · 14/22", sample: "Srinagar · Gulmarg · Pahalgam", className: "type-small" },
  { role: "label", meta: "Manrope ExtraBold · 12/16", sample: "Handpicked departures", className: "type-label" },
];

export default async function DesignSystemPage() {
  const [tours, destinations] = await Promise.all([
    loadTours(),
    loadDestinations(),
  ]);
  const tour = tours[0];
  const destination = destinations.find((item) => item.slug === "kerala") ?? destinations[0];

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-24 md:py-24">
        <header className="max-w-[760px]">
          <Kicker label="Hidden Miles · Field Journal" />
          <h1 className="type-h1 mt-4 text-ink">
            Design system
            <br />
            <span className="accent-line">v2.0</span>
          </h1>
          <p className="type-lead mt-5 text-navy-700">
            Tokens and components every page is built from. Use these values in
            code (globals.css @theme) — nothing off-scale.
          </p>
        </header>

        <section className="mt-16">
          <h2 className="type-h3 text-ink">Colour</h2>
          <div className="route-line mt-5" />
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {colours.map((colour) => (
              <div key={colour.name}>
                <div
                  className={`h-[110px] rounded-[16px] border border-sand-300 ${colour.className}`}
                />
                <p className="mt-3 text-sm font-bold text-ink">{colour.name}</p>
                <p className="mt-0.5 text-xs font-medium text-navy-500">
                  {colour.hex} · {colour.use}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="type-h3 text-ink">Typography</h2>
          <div className="route-line mt-5" />
          <div className="mt-4">
            {typeSamples.map((sample) => (
              <div
                key={sample.role}
                className="grid gap-2 border-b border-sand-100 py-5 md:grid-cols-[240px_1fr] md:items-baseline"
              >
                <p className="text-[13px] font-medium leading-5 text-navy-500">
                  <span className="block font-bold text-ink">{sample.role}</span>
                  {sample.meta}
                </p>
                <p className={`${sample.className} text-ink`}>{sample.sample}</p>
              </div>
            ))}
            <p className="mt-4 text-sm font-medium text-navy-700">
              Accent: the second line of every display headline is Fraunces
              Italic in gold-600 (gold-400 on ink).
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="type-h3 text-ink">Spacing &amp; layout</h2>
          <div className="route-line mt-5" />
          <div className="mt-7 flex flex-wrap items-end gap-6">
            {[4, 8, 12, 16, 24, 32, 48, 56, 64, 96, 128].map((step) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <span
                  className="rounded-[2px] bg-gold-400"
                  style={{ width: step, height: step }}
                />
                <span className="text-xs font-bold text-ink">{step}</span>
              </div>
            ))}
          </div>
          <p className="type-body mt-6 text-navy-700">
            Frame 1440 · content column 1200 (side margins 120) · section padding
            128 (major) / 96 (minor) · header→content 56 · card grid gap 32 ·
            radii 12 / 20 / 28 / pill.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="type-h3 text-ink">Components</h2>
          <div className="route-line mt-5" />

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button type="button" className="btn btn-ink btn-sm">
              <Phone className="h-4 w-4" /> Plan my trip
              <span className="btn-dot">→</span>
            </button>
            <button type="button" className="btn btn-primary">
              Reserve my seats
              <span className="btn-dot">→</span>
            </button>
            <button type="button" className="btn btn-outline">
              Talk to an expert
            </button>
            <button type="button" className="btn btn-light btn-sm">
              <Heart className="h-4 w-4" /> Save
            </button>
            <button type="button" className="btn btn-whatsapp">
              <Phone className="h-4 w-4" /> WhatsApp
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="chip chip-active">
              All <span className="chip-count">13</span>
            </span>
            <span className="chip">
              India <span className="chip-count">7</span>
            </span>
            <span className="chip">Women&apos;s Special</span>
            <span className="badge badge-gold">Bestseller</span>
            <span className="badge badge-blue">Group tour</span>
            <span className="badge badge-success">Verified</span>
            <span className="badge badge-danger">Filling fast</span>
            <span className="badge badge-ink">New</span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {tour ? <TourCard tour={tour} /> : null}
            {destination ? (
              <DestinationCard
                destination={destination}
                tourCount={tours.filter((item) => item.destinationSlug === destination.slug).length}
                className="min-h-[480px]"
              />
            ) : null}
            <div className="grid content-start gap-6">
              <div>
                <label htmlFor="design-field" className="field-label">
                  Where would you like to go?
                </label>
                <input
                  id="design-field"
                  placeholder="Kerala, Bali, Japan…"
                  className="field"
                />
                <p className="field-hint">Helper text sits below, 13px.</p>
              </div>
              <FeatureTile
                icon={<Check className="h-5 w-5" />}
                title="A leader on every trip"
                description="500+ trained leaders travel with you, day one to home."
              />
              <div className="flex items-center gap-3">
                <Stamp size={120} />
                <div>
                  <p className="type-label text-gold-600">Signature stamp</p>
                  <p className="type-small mt-1 text-navy-500">
                    Circular, since 1984
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-sand-300 pt-8">
          <Link href="/" className="btn btn-ink btn-sm">
            Back to the site
            <span className="btn-dot">→</span>
          </Link>
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-navy-500">
            <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
            4.9 · 12,400+ reviews
          </p>
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-navy-500">
            <Sparkles className="h-3.5 w-3.5 text-gold-600" />
            Nothing off-scale.
          </p>
        </div>
      </div>
    </div>
  );
}
