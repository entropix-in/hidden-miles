import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-ui";
import { AdminTestimonialForm } from "@/components/admin-testimonial-form";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { deleteTestimonialAction } from "@/app/admin/actions";
import { loadAdminTestimonial } from "@/lib/content";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await loadAdminTestimonial(id);

  if (!testimonial) notFound();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          eyebrow="Testimonials"
          title={testimonial.name}
          description={testimonial.tour}
        />
        <div className="mb-6 shrink-0">
          <AdminDeleteButton
            action={deleteTestimonialAction}
            id={testimonial._id}
            confirmText={`Delete testimonial from "${testimonial.name}"?`}
          />
        </div>
      </div>
      <AdminTestimonialForm testimonial={testimonial} />
    </div>
  );
}
