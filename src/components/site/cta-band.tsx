import Image from "next/image";
import Link from "next/link";
import { Contours } from "@/components/site/contours";
import { Kicker } from "@/components/site/section-heading";
import { Stamp } from "@/components/site/stamp";
import { site } from "@/data/site";
import { cn, imageUrl } from "@/lib/utils";

export function CtaBand({
  title = "Not sure where to go?",
  accent = "Let's talk it through.",
  description = "Tell us how you like to travel. A Hidden Miles specialist will send a personalised itinerary — free, within 24 hours.",
  image = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
  imageAlt = "Paris at dusk",
  className,
}: {
  title?: string;
  accent?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <section className={cn("container-page py-16 md:py-24", className)}>
      <div className="on-ink relative isolate overflow-hidden rounded-[36px] bg-ink">
        <Contours
          className="opacity-70"
          color="rgba(255,255,255,0.05)"
          cx={0.86}
          cy={0.2}
          count={7}
        />
        <div className="grid xl:grid-cols-[1fr_520px]">
          <div className="relative flex flex-col justify-center gap-7 px-7 py-12 sm:px-12 md:px-[72px] md:py-[72px]">
            <Kicker label="Free trip planning" dark />
            <h2 className="type-h2 max-w-xl text-paper">
              {title}
              <br />
              <span className="accent-line">{accent}</span>
            </h2>
            <p className="type-lead max-w-[500px] text-navy-200">{description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary btn-lg">
                Plan my trip
                <span className="btn-dot">→</span>
              </Link>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-lg"
              >
                Chat on WhatsApp
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-bold text-navy-200">
              <span>✓&nbsp; Reply in 24 hrs</span>
              <span>✓&nbsp; No planning fee</span>
              <span>✓&nbsp; 4.9★ rated</span>
            </div>
          </div>

          <div className="relative hidden min-h-[420px] xl:block">
            <Image
              src={imageUrl(image, 1200)}
              alt={imageAlt}
              fill
              sizes="520px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-transparent" />
            <span className="absolute bottom-12 right-12">
              <Stamp size={140} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
