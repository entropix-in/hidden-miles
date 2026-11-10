import { Breadcrumbs } from "@/components/site/breadcrumbs";

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-stone-200/80 bg-sand-100">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-navy-200/40 blur-3xl" />
      <div className="container-page relative py-12 sm:py-16">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div className="animate-rise max-w-3xl">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.08] tracking-tight text-navy-950 sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
          {children ? <div className="animate-rise">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
