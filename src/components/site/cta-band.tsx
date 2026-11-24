import Image from "next/image";
import Link from "next/link";
import { Contours } from "@/components/site/contours";
import { Stamp } from "@/components/site/stamp";
import { site } from "@/data/site";
import { cn, imageUrl } from "@/lib/utils";

export function CtaBand({
  title = "Not sure where to go?",
  accent = "Let's talk it through.",
  description = "Get a free personalised itinerary within 24 hours.",
  image = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
  imageAlt = "Paris at dusk",
  className,
}: {
  title?: string;
  accent?: string;
  description?: string;
  image?: string | null;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <section className={cn("container-page pb-14 md:pb-20", className)}>
      <div className="on-ink relative isolate overflow-hidden rounded-[28px] bg-ink">
        <Contours
          className="opacity-70"
          color="rgba(255,255,255,0.05)"
          cx={0.86}
          cy={0.2}
          count={7}
        />
        <div className={cn("grid", image && "xl:grid-cols-[1fr_520px]")}>
          <div className="relative flex flex-col justify-center gap-6 px-6 py-12 sm:px-12 md:px-16 md:py-16">
            <h2 className="type-h2 max-w-xl text-paper">
              {title}
              <br />
              <span className="accent-line">{accent}</span>
            </h2>
            <p className="type-body -mt-2 max-w-[460px] text-navy-200">{description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                Plan my trip
                <span className="btn-dot">→</span>
              </Link>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {image ? (
          <div className="relative hidden min-h-[360px] xl:block">
            <Image
              src={imageUrl(image, 1200)}
              alt={imageAlt}
              fill
              sizes="520px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-transparent" />
            <span className="absolute bottom-10 right-10">
              <Stamp size={112} />
            </span>
          </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
