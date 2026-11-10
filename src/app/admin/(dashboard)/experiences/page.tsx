import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  DatabaseSetupNotice,
} from "@/components/admin-ui";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { deleteExperienceAction } from "@/app/admin/actions";
import { ExperienceIcon } from "@/components/experience-icon";
import { loadAdminExperiences } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export default async function AdminExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";
  const result = await loadAdminExperiences();

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader
          eyebrow="Experiences"
          title="Experiences"
          description="Travel styles that packages can be tagged with."
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
        eyebrow="Experiences"
        title="Experiences"
        description="Travel styles travellers can browse and filter by."
        actionHref="/admin/experiences/new"
        actionLabel="New experience"
      />

      {result.status.error ? (
        <AdminNotice error={result.status.error} />
      ) : null}

      {result.data.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.data.map((experience) => (
            <article
              key={experience._id}
              className="overflow-hidden rounded-[26px] border border-stone-200 bg-white"
            >
              <div className="relative aspect-[16/9]">
                {experience.image ? (
                  <Image
                    src={imageUrl(experience.image, 600)}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-cream-200 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 to-transparent" />
                <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-saffron-700">
                  <ExperienceIcon icon={experience.icon} />
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl font-semibold text-forest-950">
                  {experience.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-stone-500">
                  {experience.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/tours?experience=${experience.slug}`}
                    target="_blank"
                    className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 text-stone-500 transition hover:border-saffron-400 hover:text-saffron-700"
                    aria-label={`View ${experience.title} on the website`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/admin/experiences/${experience._id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-cream-50 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-wider text-forest-950 transition hover:border-saffron-400"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <AdminDeleteButton
                    action={deleteExperienceAction}
                    id={experience._id}
                    confirmText={`Delete "${experience.title}"? This cannot be undone.`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="No experiences yet"
          description="Add the first experience, or import the starter content from the dashboard."
          actionHref="/admin/experiences/new"
          actionLabel="Add experience"
        />
      )}
    </div>
  );
}
