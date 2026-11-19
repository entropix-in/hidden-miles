import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminExperienceForm } from "@/components/admin/admin-experience-form";

export default function NewExperiencePage() {
  return (
    <div>
      <AdminPageHeader
        title="Add an experience"
      />
      <AdminExperienceForm />
    </div>
  );
}
