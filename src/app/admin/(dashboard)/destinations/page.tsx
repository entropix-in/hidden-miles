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
import { deleteDestinationAction } from "@/app/admin/actions";
import { loadAdminDestinations, loadAdminTours } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export default async function AdminDestinationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";
  const [result, tours] = await Promise.all([
    loadAdminDestinations(),
    loadAdminTours(),
  ]);

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader
          eyebrow="Destinations"
          title="Destinations"
          description="The places travellers can explore on Hidden Miles."
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
        eyebrow="Destinations"
        title="Destinations"
        description="The places travellers can explore. Packages are grouped by destination."
        actionHref="/admin/destinations/new"
        actionLabel="New destination"
      />

      {result.status.error ? (
        <AdminNotice error={result.status.error} />
      ) : null}

      {result.data.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.data.map((destination) => {
            const count = tours.data.filter(
              (tour) => tour.destinationSlug === destination.slug,
            ).length;

            return (
              <article
                key={destination._id}
                className="overflow-hidden rounded-[26px] border border-stone-200 bg-white"
              >
                <div className="relative aspect-[16/9]">
                  {destination.image ? (
                    <Image
                      src={imageUrl(destination.image, 600)}
                      alt={destination.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-sand-200 text-sm font-bold uppercase tracking-wider text-stone-400">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-sand-50">
                    <p className="text-sm font-extrabold uppercase tracking-wider text-blue-300">
                      {destination.region} · {count}{" "}
                      {count === 1 ? "package" : "packages"}
                    </p>
                    <h2 className="font-display text-2xl font-semibold">
                      {destination.name}
                    </h2>
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 text-sm leading-5 text-stone-500">
                    {destination.tagline || destination.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/destinations/${destination.slug}`}
                      target="_blank"
                      className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 text-stone-500 transition hover:border-blue-400 hover:text-blue-700"
                      aria-label={`View ${destination.name} on the website`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/admin/destinations/${destination._id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-sand-50 px-3.5 py-2 text-sm font-extrabold uppercase tracking-wider text-navy-950 transition hover:border-blue-400"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <AdminDeleteButton
                      action={deleteDestinationAction}
                      id={destination._id}
                      confirmText={`Delete "${destination.name}"? This cannot be undone.`}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <AdminEmptyState
          title="No destinations yet"
          description="Add the first destination, or import the starter content from the dashboard."
          actionHref="/admin/destinations/new"
          actionLabel="Add destination"
        />
      )}
    </div>
  );
}
