import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminTourForm } from "@/components/admin/admin-tour-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteTourAction } from "@/app/admin/actions";
import { loadAdminDestinations, loadAdminExperiences, loadAdminTour } from "@/lib/content";
import { destinations as staticDestinations } from "@/data/destinations";
import { experiences as staticExperiences } from "@/data/experiences";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tour, experiences, destinations] = await Promise.all([
    loadAdminTour(id),
    loadAdminExperiences(),
    loadAdminDestinations(),
  ]);

  if (!tour) notFound();

  const options = experiences.data.length
    ? experiences.data
    : staticExperiences;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          title={tour.title}
        />
        <div className="mb-6 shrink-0">
          <AdminDeleteButton
            action={deleteTourAction}
            id={tour._id}
            confirmText={`Delete "${tour.title}"? This cannot be undone.`}
          />
        </div>
      </div>

      <AdminTourForm
        tour={tour}
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
