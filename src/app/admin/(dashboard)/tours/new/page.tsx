import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminTourForm } from "@/components/admin/admin-tour-form";
import { loadAdminDestinations, loadAdminExperiences } from "@/lib/content";
import { destinations as staticDestinations } from "@/data/destinations";
import { experiences as staticExperiences } from "@/data/experiences";

export default async function NewTourPage() {
  const [result, destinations] = await Promise.all([loadAdminExperiences(), loadAdminDestinations()]);
  const options = result.data.length ? result.data : staticExperiences;

  return (
    <div>
      <AdminPageHeader
        title="Create a package"
      />
      <AdminTourForm
        destinationOptions={(destinations.status.seeded ? destinations.data : staticDestinations)
          .map(({ slug, name, region }) => ({ slug, name, region }))}
        experienceOptions={options.map((experience) => ({
          slug: experience.slug,
          title: experience.title,
          shortTitle: experience.shortTitle,
        }))}
      />
    </div>
  );
}
