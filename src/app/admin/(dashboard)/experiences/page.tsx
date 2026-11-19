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
import { deleteExperienceAction } from "@/app/admin/actions";
import { ExperienceIcon } from "@/components/site/experience-icon";
import { loadAdminExperiences } from "@/lib/content";
import { imageUrl } from "@/lib/utils";

export default async function AdminExperiencesPage() {
  const result = await loadAdminExperiences();

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader
          title="Experiences"
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
        title="Experiences"
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
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
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
                  <div className="grid h-full w-full place-items-center bg-sand-200 text-sm font-bold text-stone-400">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-blue-700">
                  <ExperienceIcon icon={experience.icon} />
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-display text-xl font-semibold text-navy-950">
                  {experience.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone-500">
                  {experience.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/tours?experience=${experience.slug}`}
                    target="_blank"
                    className="btn-outline admin-icon-button"
                    aria-label={`View ${experience.title} on the website`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/admin/experiences/${experience._id}`}
                    className="btn-outline"
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
