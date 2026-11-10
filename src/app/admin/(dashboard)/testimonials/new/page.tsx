import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminTestimonialForm } from "@/components/admin/admin-testimonial-form";

export default function NewTestimonialPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Testimonials"
        title="Add a testimonial"
        description="Share a guest story on the website."
      />
      <AdminTestimonialForm />
    </div>
  );
}
