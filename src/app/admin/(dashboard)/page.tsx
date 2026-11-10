import Link from "next/link";
import {
  ArrowUpRight,
  Database,
  Inbox,
  MapPin,
  MessageSquareQuote,
  Package,
  Sparkles,
} from "lucide-react";
import {
  AdminNotice,
  AdminPageHeader,
  DatabaseSetupNotice,
} from "@/components/admin-ui";
import { seedContentAction } from "@/app/admin/actions";
import {
  loadAdminDestinations,
  loadAdminEnquiries,
  loadAdminExperiences,
  loadAdminTestimonials,
  loadAdminTours,
} from "@/lib/content";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";

  const [tours, destinations, experiences, testimonials, enquiries] =
    await Promise.all([
      loadAdminTours(),
      loadAdminDestinations(),
      loadAdminExperiences(),
      loadAdminTestimonials(),
      loadAdminEnquiries(),
    ]);

  const status = tours.status;
  const newEnquiries = enquiries.data.filter(
    (enquiry) => (enquiry.status ?? "new") === "new",
  ).length;

  const stats = [
    {
      label: "Tour packages",
      value: tours.data.length,
      href: "/admin/tours",
      icon: Package,
    },
    {
      label: "Destinations",
      value: destinations.data.length,
      href: "/admin/destinations",
      icon: MapPin,
    },
    {
      label: "Experiences",
      value: experiences.data.length,
      href: "/admin/experiences",
      icon: Sparkles,
    },
    {
      label: "Testimonials",
      value: testimonials.data.length,
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
    },
  ];

  return (
    <div>
      <AdminNotice notice={notice} error={error} />
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Welcome back."
        description="Everything travellers see on Hidden Miles is managed from here and stored in MySQL."
        actionHref="/admin/tours/new"
        actionLabel="New package"
      />

      {!status.configured ? (
        <DatabaseSetupNotice configured={status.configured} error={status.error} />
      ) : (
        <>
          {status.error ? <AdminNotice error={status.error} /> : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="group rounded-[26px] border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-saffron-300 hover:shadow-xl hover:shadow-forest-950/5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-cream-200 text-saffron-700">
                    <stat.icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-stone-300 transition group-hover:text-saffron-600" />
                </div>
                <p className="mt-4 font-display text-4xl font-semibold text-forest-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>

          {!status.seeded ? (
            <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[28px] border border-saffron-200 bg-saffron-50 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700">
                  <Database className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-forest-950">
                    Import your starter content
                  </h2>
                  <p className="mt-1 max-w-xl text-[12px] leading-5 text-stone-600">
                    Bring the existing packages, destinations, experiences and
                    testimonials into MySQL. You can edit or delete anything
                    afterwards.
                  </p>
                </div>
              </div>
              <form action={seedContentAction} className="shrink-0">
                <button type="submit" className="btn-primary">
                  Import starter content
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-forest-200 bg-forest-50 px-6 py-4">
              <p className="text-[12px] font-bold text-forest-800">
                Content is live from MySQL. New changes publish to the website
                immediately.
              </p>
              <Link
                href="/tours"
                className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-forest-700 hover:text-forest-900"
              >
                View website
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
            <section className="rounded-[28px] border border-stone-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Inbox</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-forest-950">
                    Recent enquiries
                  </h2>
                </div>
                <span className="rounded-full bg-saffron-100 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-saffron-800">
                  {newEnquiries} new
                </span>
              </div>

              {enquiries.data.length ? (
                <div className="mt-5 space-y-2.5">
                  {enquiries.data.slice(0, 5).map((enquiry) => (
                    <div
                      key={enquiry._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-100 bg-cream-50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-extrabold text-forest-950">
                          {enquiry.name}
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            {enquiry.type}
                          </span>
                        </p>
                        <p className="truncate text-[11px] text-stone-500">
                          {enquiry.tour ||
                            enquiry.destination ||
                            enquiry.email ||
                            "General enquiry"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-stone-500">
                        {enquiry.status ?? "new"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-8 text-sm text-stone-500">
                  <Inbox className="h-5 w-5 text-stone-300" />
                  No enquiries yet. They will appear here as travellers get in
                  touch.
                </div>
              )}

              <Link
                href="/admin/enquiries"
                className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-saffron-700 hover:text-saffron-800"
              >
                Open enquiries
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </section>

            <section className="rounded-[28px] bg-forest-950 p-6 text-cream-50">
              <p className="eyebrow text-saffron-300">Quick actions</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Publish something new
              </h2>
              <div className="mt-5 grid gap-2">
                {[
                  {
                    label: "Create a tour package",
                    href: "/admin/tours/new",
                    icon: Package,
                  },
                  {
                    label: "Add a destination",
                    href: "/admin/destinations/new",
                    icon: MapPin,
                  },
                  {
                    label: "Add an experience",
                    href: "/admin/experiences/new",
                    icon: Sparkles,
                  },
                  {
                    label: "Add a testimonial",
                    href: "/admin/testimonials/new",
                    icon: MessageSquareQuote,
                  },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[12px] font-bold text-cream-100 transition hover:border-saffron-400/40 hover:bg-white/10"
                  >
                    <action.icon className="h-4 w-4 text-saffron-300" />
                    {action.label}
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-cream-200/40" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
