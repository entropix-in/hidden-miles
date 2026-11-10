import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminDestinationForm } from "@/components/admin/admin-destination-form";

export default function NewDestinationPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Destinations"
        title="Add a destination"
        description="A destination groups packages and appears on the destinations page."
      />
      <AdminDestinationForm />
    </div>
  );
}
