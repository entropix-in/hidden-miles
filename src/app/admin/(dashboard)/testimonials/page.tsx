import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteTestimonialAction } from "@/app/admin/actions";
import { loadAdminTestimonials } from "@/lib/content";

export default async function AdminTestimonialsPage() {
  const result = await loadAdminTestimonials();

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader
          title="Testimonials"
        />
        <DatabaseSetupNotice
          configured={result.status.configured}
          error={result.status.error}
        />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        actionHref="/admin/testimonials/new"
        actionLabel="New testimonial"
      />

      {result.status.error ? (
        <AdminNotice error={result.status.error} />
      ) : null}

      {result.data.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {result.data.map((testimonial) => (
            <article
              key={testimonial._id}
              className="flex flex-col rounded-xl border border-stone-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-0.5 text-gold-500">
                  {Array.from({ length: Math.min(testimonial.rating, 5) }).map(
                    (_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                    ),
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/testimonials/${testimonial._id}`}
                    className="btn-outline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <AdminDeleteButton
                    action={deleteTestimonialAction}
                    id={testimonial._id}
                    confirmText={`Delete testimonial from "${testimonial.name}"?`}
                  />
                </div>
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-6 text-stone-600">
                “{testimonial.quote}”
              </blockquote>
              <p className="mt-4 border-t border-dashed border-stone-200 pt-3 text-sm font-medium text-(--studio-text)">
                {testimonial.name}
                <span className="ml-2 font-medium text-stone-500">
                  {testimonial.city} · {testimonial.tour}
                </span>
              </p>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="No testimonials yet"
          description="Add guest stories, or import the starter content from the dashboard."
          actionHref="/admin/testimonials/new"
          actionLabel="Add testimonial"
        />
      )}
    </div>
  );
}
