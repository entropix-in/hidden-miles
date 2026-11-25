import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ExternalLink, Pencil, Search } from "lucide-react";
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

import { AdminSelect } from "@/components/admin/admin-select";
import { AdminListPagination, adminPageNumber } from "@/components/admin/admin-list-pagination";

const pageSize = 10;

export default async function AdminToursPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [result, params] = await Promise.all([loadAdminTours(), searchParams]);
  const tours = result.data;

  const query = typeof params.q === "string" ? params.q.trim() : "";
  const region = params.region === "India" || params.region === "International" ? params.region : "";
  const featured = params.featured === "yes" || params.featured === "no" ? params.featured : "";
  const search = query.toLowerCase();
  const matched = tours.filter((tour) =>
    (!region || tour.region === region) &&
    (!featured || Boolean(tour.featured) === (featured === "yes")) &&
    (!search || `${tour.title} ${tour.destinationName} ${tour.slug}`.toLowerCase().includes(search)));
  const filters = new URLSearchParams();
  if (query) filters.set("q", query);
  if (region) filters.set("region", region);
  if (featured) filters.set("featured", featured);
  const page = adminPageNumber(params.page, Math.max(1, Math.ceil(matched.length / pageSize)));

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader
          title="Tour packages"
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
      <AdminPageHeader
        title="Tour packages"
        actionHref="/admin/tours/new"
        actionLabel="New package"
      />

      {result.status.error ? (
        <AdminNotice error={result.status.error} />
      ) : null}

      {!result.status.seeded ? (
        <div className="mb-4 rounded-2xl border border-(--studio-rule) bg-(--studio-pine-wash) px-4 py-3 text-sm font-medium text-(--studio-pine)">
          Starter content has not been imported yet.{" "}
          <Link href="/admin" className="underline">
            Import it from the dashboard
          </Link>{" "}
          or create your first package below.
        </div>
      ) : null}

      {!!tours.length && (
        <search className="admin-filter-panel mb-4">
          <form action="/admin/tours" method="get" className="admin-list-filters" key={filters.toString()}>
            <label><span className="field-label">Search packages</span>
              <span className="admin-search-field"><Search size={16} aria-hidden />
                <input className="field" type="search" name="q" defaultValue={query} placeholder="Name or destination" />
              </span>
            </label>
            <label><span className="field-label">Region</span>
              <AdminSelect name="region" defaultValue={region}><option value="">All regions</option>
                <option value="India">India</option><option value="International">International</option>
              </AdminSelect>
            </label>
            <label><span className="field-label">Featured</span>
              <AdminSelect name="featured" defaultValue={featured}><option value="">All packages</option>
                <option value="yes">Featured</option><option value="no">Not featured</option>
              </AdminSelect>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn-outline" type="submit">Apply filters</button>
              {!!filters.size && <Link className="admin-text-action" href="/admin/tours">Clear</Link>}
            </div>
          </form>
        </search>
      )}
      {!!tours.length && <p className="admin-editor-help mb-3">{matched.length} {matched.length === 1 ? "package" : "packages"}</p>}

      {matched.length ? (
        <div className="space-y-3">
          {matched.slice((page - 1) * pageSize, page * pageSize).map((tour) => (
            <article
              key={tour._id}
              className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-[8px] sm:aspect-[4/3] sm:h-[72px] sm:w-24">
                {tour.image ? (
                  <Image
                    src={imageUrl(tour.image, 300)}
                    alt={tour.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-sand-200 text-sm font-medium text-stone-500">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sand-200 px-2.5 py-1 text-sm font-medium text-(--studio-secondary)">
                    {tour.region}
                  </span>
                  {tour.featured ? (
                    <span className="rounded-full bg-(--studio-pine-wash) px-2.5 py-1 text-sm font-medium text-(--studio-pine)">
                      Featured
                    </span>
                  ) : null}
                  <span className="text-sm font-medium text-stone-500">
                    {tour.nights}N / {tour.days}D
                  </span>
                </div>
                <h2 className="mt-1 text-base font-medium text-(--studio-text)">
                  <Link href={`/admin/tours/${tour._id}`} className="hover:underline">{tour.title}</Link>
                </h2>
                <p className="mt-1 text-sm font-medium text-stone-500">
                  {tour.destinationName} · {formatINR(tour.price)} per person
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Link href={`/admin/departures?tour=${encodeURIComponent(tour.slug)}`} className="btn-outline">
                  <CalendarDays size={16} aria-hidden /> Departure dates
                </Link>
                <Link
                  href={`/tours/${tour.slug}`}
                  target="_blank"
                  className="btn-outline admin-icon-button"
                  aria-label={`View ${tour.title} on the website`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/admin/tours/${tour._id}/edit`}
                  className="btn-outline"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <AdminDeleteButton
                  action={deleteTourAction}
                  id={tour._id}
                  label={`Delete ${tour.title}`} compact
                  confirmText={`Delete "${tour.title}"? This cannot be undone.`}
                />
              </div>
            </article>
          ))}
        </div>
      ) : tours.length ? (
        <AdminEmptyState title="No packages match" description="Try another search or clear the filters."
          actionHref="/admin/tours" actionLabel="Clear filters" />
      ) : (
        <AdminEmptyState
          title="No packages yet"
          description="Create your first tour package, or import the starter content from the dashboard."
          actionHref="/admin/tours/new"
          actionLabel="Create package"
        />
      )}
      <AdminListPagination path="/admin/tours" filters={filters} page={page} pageSize={pageSize} total={matched.length} />
    </div>
  );
}
