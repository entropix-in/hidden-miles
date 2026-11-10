import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminExperienceForm } from "@/components/admin/admin-experience-form";

export default function NewExperiencePage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Experiences"
        title="Add an experience"
        description="Experiences appear on the home page and power package filters."
      />
      <AdminExperienceForm />
    </div>
  );
}
