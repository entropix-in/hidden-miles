import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteTourAction } from "@/app/admin/actions";
import { loadAdminTours } from "@/lib/content";
import { formatINR, imageUrl } from "@/lib/utils";

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";
  const result = await loadAdminTours();
  const tours = result.data;

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader
          eyebrow="Packages"
          title="Tour packages"
          description="Create and manage the journeys travellers can book."
        />
        <DatabaseSetupNotice
          configured={result.status.configured}
          error={result.status.error}
        />
      </div>
    );
  }

  return (
    <div>
      <AdminNotice notice={notice} error={error} />
      <AdminPageHeader
        eyebrow="Packages"
        title="Tour packages"
        description="Create and manage the journeys travellers can book. Changes go live immediately."
        actionHref="/admin/tours/new"
        actionLabel="New package"
      />

      {result.status.error ? (
        <AdminNotice error={result.status.error} />
      ) : null}

      {!result.status.seeded ? (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
          Starter content has not been imported yet.{" "}
          <Link href="/admin" className="underline">
            Import it from the dashboard
          </Link>{" "}
          or create your first package below.
        </div>
      ) : null}

      {tours.length ? (
        <div className="space-y-3">
          {tours.map((tour) => (
            <article
              key={tour._id}
              className="flex flex-col gap-4 rounded-[26px] border border-stone-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-28">
                {tour.image ? (
                  <Image
                    src={imageUrl(tour.image, 300)}
                    alt={tour.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-sand-200 text-sm font-bold uppercase tracking-wider text-stone-400">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sand-200 px-2.5 py-1 text-sm font-extrabold uppercase tracking-wider text-navy-800">
                    {tour.region}
                  </span>
                  {tour.featured ? (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-sm font-extrabold uppercase tracking-wider text-blue-800">
                      Featured
                    </span>
                  ) : null}
                  <span className="text-sm font-bold uppercase tracking-wider text-stone-400">
                    {tour.nights}N / {tour.days}D
                  </span>
                </div>
                <h2 className="mt-1.5 font-display text-xl font-semibold text-navy-950">
                  {tour.title}
                </h2>
                <p className="mt-0.5 text-sm font-semibold text-stone-500">
                  {tour.destinationName} · {formatINR(tour.price)} per person
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Link
                  href={`/tours/${tour.slug}`}
                  target="_blank"
                  className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 text-stone-500 transition hover:border-blue-400 hover:text-blue-700"
                  aria-label={`View ${tour.title} on the website`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/admin/tours/${tour._id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-sand-50 px-3.5 py-2 text-sm font-extrabold uppercase tracking-wider text-navy-950 transition hover:border-blue-400"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <AdminDeleteButton
                  action={deleteTourAction}
                  id={tour._id}
                  label="Delete"
                  confirmText={`Delete "${tour.title}"? This cannot be undone.`}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="No packages yet"
          description="Create your first tour package, or import the starter content from the dashboard."
          actionHref="/admin/tours/new"
          actionLabel="Create package"
        />
      )}
    </div>
  );
}
