import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminExperienceForm } from "@/components/admin/admin-experience-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteExperienceAction } from "@/app/admin/actions";
import { loadAdminExperience } from "@/lib/content";

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experience = await loadAdminExperience(id);

  if (!experience) notFound();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          eyebrow="Experiences"
          title={experience.title}
          description={`Editing /experiences?experience=${experience.slug}`}
        />
        <div className="mb-6 shrink-0">
          <AdminDeleteButton
            action={deleteExperienceAction}
            id={experience._id}
            confirmText={`Delete "${experience.title}"? This cannot be undone.`}
          />
        </div>
      </div>
      <AdminExperienceForm experience={experience} />
    </div>
  );
}
