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
  children,
  showImageOnMobile = false,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  title: string;
  accent?: string;
  description?: React.ReactNode;
  image: string;
  imageAlt?: string;
  children?: React.ReactNode;
  /** Listing pages hide the photo on phones so content starts sooner. */
  showImageOnMobile?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("container-page pt-8 pb-10 md:pt-12 md:pb-14", className)}>
      <div
        className={cn(
          "grid gap-8 xl:grid-cols-[1fr_500px] xl:gap-12",
          description ? "items-start" : "items-center",
        )}
      >
        <div className="max-w-[600px]">
          <Breadcrumbs items={items} />
          <h1 className="type-h1 mt-4 text-ink">
            {title}
            {accent ? (
              <>
                <br />
                <span className="accent-line">{accent}</span>
              </>
            ) : null}
          </h1>
          {description ? (
            <p className="type-lead mt-4 max-w-[480px] text-navy-700">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>

        <div
          className={cn(
            "relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-ink sm:block",
            // A heading-only hero gets a shorter photo so the text column isn't left with dead space.
            description ? "xl:aspect-[16/11]" : children ? "xl:aspect-[2/1]" : "xl:aspect-[21/9]",
            !showImageOnMobile && "hidden",
          )}
        >
          <Image
            src={imageUrl(image, 1200)}
            alt={imageAlt ?? title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 500px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
