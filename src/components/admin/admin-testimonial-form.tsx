import Link from "next/link";
import { Save } from "lucide-react";
import { saveTestimonialAction } from "@/app/admin/actions";
import type { AdminTestimonial } from "@/lib/types";

export function AdminTestimonialForm({
  testimonial,
}: {
  testimonial?: AdminTestimonial;
}) {
  return (
    <form action={saveTestimonialAction} className="space-y-5">
      <input type="hidden" name="id" value={testimonial?._id ?? ""} />

      <section className="rounded-[28px] border border-stone-200 bg-white p-6">
        <p className="eyebrow">Guest story</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950">
          Testimonial details
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
            <label htmlFor="rating" className="field-label">
              Rating (1–5)
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              min="1"
              max="5"
              step="1"
              defaultValue={testimonial?.rating ?? 5}
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="quote" className="field-label">
              Quote
            </label>
            <textarea
              id="quote"
              name="quote"
              rows={5}
              defaultValue={testimonial?.quote ?? ""}
              placeholder="Our tour leader felt like family by day two..."
              className="field resize-none"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-stone-200 bg-white px-6 py-4">
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
