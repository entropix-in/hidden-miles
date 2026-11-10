import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminTourForm } from "@/components/admin/admin-tour-form";
import { loadAdminExperiences } from "@/lib/content";
import { experiences as staticExperiences } from "@/data/experiences";

export default async function NewTourPage() {
  const result = await loadAdminExperiences();
  const options = result.data.length ? result.data : staticExperiences;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Packages"
        title="Create a package"
        description="Build a journey for travellers. You can edit everything later."
      />
      <AdminTourForm
        experienceOptions={options.map((experience) => ({
          slug: experience.slug,
          title: experience.title,
          shortTitle: experience.shortTitle,
        }))}
      />
    </div>
  );
}
