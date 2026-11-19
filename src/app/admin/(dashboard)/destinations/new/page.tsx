import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminDestinationForm } from "@/components/admin/admin-destination-form";

export default function NewDestinationPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add a destination"
      />
      <AdminDestinationForm />
    </div>
  );
}
