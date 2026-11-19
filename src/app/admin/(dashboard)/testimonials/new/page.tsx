import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminTestimonialForm } from "@/components/admin/admin-testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div>
      <AdminPageHeader
        title="Add a testimonial"
      />
      <AdminTestimonialForm />
    </div>
  );
}
