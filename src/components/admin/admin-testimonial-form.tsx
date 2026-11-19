import { AdminRichField } from "./admin-rich-fields";
import Link from "next/link";
import { Save } from "lucide-react";
import { saveTestimonialAction } from "@/app/admin/actions";
import { AdminStarRating } from "@/components/admin/admin-star-rating";
import type { AdminTestimonial } from "@/lib/types";

export function AdminTestimonialForm({
  testimonial,
}: {
  testimonial?: AdminTestimonial;
}) {
  return (
    <form action={saveTestimonialAction} className="space-y-4">
      <input type="hidden" name="id" value={testimonial?._id ?? ""} />

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">
          Testimonial details
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="field-label">
              Guest name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={testimonial?.name ?? ""}
              placeholder="Ananya Deshpande"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="city" className="field-label">
              City
            </label>
            <input
              id="city"
              name="city"
              defaultValue={testimonial?.city ?? ""}
              placeholder="Pune"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="tour" className="field-label">
              Tour
            </label>
            <input
              id="tour"
              name="tour"
              defaultValue={testimonial?.tour ?? ""}
              placeholder="Magical Kashmir"
              className="field"
            />
          </div>
          <div>
            <AdminStarRating defaultValue={testimonial?.rating ?? 5} />
          </div>
          <div className="sm:col-span-2">
            <AdminRichField name="quote" label="Quote"
              initial={testimonial?.quote} editor={testimonial?.richFields?.quote} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-5 py-4">
        <Link href="/admin/testimonials" className="btn-outline">
          Cancel
        </Link>
        <button type="submit" className="btn-primary">
          <Save className="h-4 w-4" />
          {testimonial ? "Save changes" : "Create testimonial"}
        </button>
      </div>
    </form>
  );
}
