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

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";
  const result = await loadAdminTestimonials();

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader
          eyebrow="Testimonials"
          title="Testimonials"
          description="Guest stories shown on the home page."
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
      <AdminNotice notice={notice} error={error} />
      <AdminPageHeader
        eyebrow="Testimonials"
        title="Testimonials"
        description="Real guest stories build trust. Every testimonial appears in the home page review carousel, newest first."
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
              className="flex flex-col rounded-[26px] border border-stone-200 bg-white p-5"
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-sand-50 px-3.5 py-2 text-sm font-extrabold uppercase tracking-wider text-navy-950 transition hover:border-blue-400"
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
              <p className="mt-4 border-t border-dashed border-stone-200 pt-3 text-sm font-extrabold text-navy-950">
                {testimonial.name}
                <span className="ml-2 font-semibold text-stone-400">
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
