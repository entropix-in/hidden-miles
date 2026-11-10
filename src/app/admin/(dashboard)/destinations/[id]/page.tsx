import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminDestinationForm } from "@/components/admin/admin-destination-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteDestinationAction } from "@/app/admin/actions";
import { loadAdminDestination } from "@/lib/content";

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const destination = await loadAdminDestination(id);

  if (!destination) notFound();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          eyebrow="Destinations"
          title={destination.name}
          description={`Editing /destinations/${destination.slug}`}
        />
        <div className="mb-6 shrink-0">
          <AdminDeleteButton
            action={deleteDestinationAction}
            id={destination._id}
            confirmText={`Delete "${destination.name}"? This cannot be undone.`}
          />
        </div>
      </div>
      <AdminDestinationForm destination={destination} />
    </div>
  );
}
