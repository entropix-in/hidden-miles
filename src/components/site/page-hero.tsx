import Image from "next/image";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { imageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PageHero({
  items,
  title,
  accent,
  description,
  image,
  imageAlt,
  coords,
  children,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  title: string;
  accent?: string;
  description: string;
  image: string;
  imageAlt?: string;
  coords?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("container-page pt-10 pb-16 md:pt-14 md:pb-24", className)}>
      <div className="grid items-center gap-10 xl:grid-cols-[1fr_560px] xl:gap-16">
        <div className="max-w-[600px]">
          <Breadcrumbs items={items} />
          <h1 className="type-h1 mt-7 text-ink">
            {title}
            {accent ? (
              <>
                <br />
                <span className="accent-line">{accent}</span>
              </>
            ) : null}
          </h1>
          <p className="type-lead mt-6 max-w-[520px] text-navy-700">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>

        <div className="relative aspect-[14/11] w-full overflow-hidden rounded-[28px] bg-ink xl:aspect-[560/440]">
          <Image
            src={imageUrl(image, 1200)}
            alt={imageAlt ?? title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          {coords ? (
            <span className="coord coord-dark absolute bottom-6 left-6">
              {coords}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
