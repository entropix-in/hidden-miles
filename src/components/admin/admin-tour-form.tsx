"use client";

import { AdminHighlightsField } from "./admin-highlights-field";
import { AdminRichField } from "./admin-rich-fields";
import { AdminCheckbox } from "./admin-checkbox";
import { AdminAuthoringForm } from "./admin-authoring-form";
import { AdminContentEditor } from "./admin-content-editor";
import { DestinationPicker, type DestinationOption } from "./admin-destination-picker";
import { AdminPageUrl } from "./admin-page-url";
import { CoverPhotoField } from "./admin-photo-upload";
import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { saveTourAction } from "@/app/admin/actions";
import type { AdminTour } from "@/lib/types";
import type { TourCity } from "@/lib/tour-cities";
import { defaultTourCities } from "@/lib/tour-cities";
import { AdminItineraryEditor } from "./admin-itinerary-editor";
import { AdminTourAddons } from "./admin-tour-addons";
import { AdminTourExperiences, type ExperienceOption } from "./admin-tour-experiences";

function DepartureCitiesEditor({ initial }: { initial: TourCity[] }) {
  const [cities, setCities] = useState<TourCity[]>(
    initial.length ? initial : defaultTourCities,
  );

  function update(index: number, field: keyof TourCity, value: string) {
    setCities((current) =>
      current.map((city, cityIndex) =>
        cityIndex === index
          ? {
              ...city,
              [field]: field === "priceDelta" ? Number(value) || 0 : value,
            }
          : city,
      ),
    );
  }

  function addCity() {
    if (cities.length >= 12) return;
    setCities((current) => [
      ...current,
      { name: "", note: "Flight included", priceDelta: 0 },
    ]);
  }

  function removeCity(index: number) {
    if (cities.length <= 1) return;
    setCities((current) =>
      current.filter((_, cityIndex) => cityIndex !== index),
    );
  }

  return (
    <div>
      <input
        type="hidden"
        name="departureCities"
        value={JSON.stringify(cities)}
      />

      <div className="mt-4 space-y-3">
        {cities.map((city, index) => (
          <div
            key={index}
            className="rounded-2xl border border-stone-200 bg-sand-50 p-5"
          >
            <div className="grid gap-3 sm:grid-cols-[1.1fr_1.5fr_0.7fr_auto] sm:items-end">
              <div>
                <label htmlFor={`city-name-${index}`} className="field-label">
                  City
                </label>
                <input
                  id={`city-name-${index}`}
                  value={city.name}
                  onChange={(event) =>
                    update(index, "name", event.target.value)
                  }
                  placeholder="Mumbai"
                  maxLength={120}
                  className="field h-10"
                />
              </div>
              <div>
                <label htmlFor={`city-note-${index}`} className="field-label">
                  Note shown to travellers
                </label>
                <input
                  id={`city-note-${index}`}
                  value={city.note}
                  onChange={(event) =>
                    update(index, "note", event.target.value)
                  }
                  placeholder="Flight included"
                  maxLength={190}
                  className="field h-10"
                />
              </div>
              <div>
                <label htmlFor={`city-delta-${index}`} className="field-label">
                  Fare adjustment (₹)
                </label>
                <input
                  id={`city-delta-${index}`}
                  type="number"
                  step="100"
                  value={city.priceDelta}
                  onChange={(event) =>
                    update(index, "priceDelta", event.target.value)
                  }
                  className="field h-10"
                />
              </div>
              <button
                type="button"
                onClick={() => removeCity(index)}
                disabled={cities.length <= 1}
                aria-label={`Remove ${city.name || "departure city"}`}
                className="btn-outline admin-icon-button admin-button-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-stone-600">
          The adjustment is added to the per-person package price. Use a
          negative number for land-only or join-at-destination options. Leave 0
          to include flights at the base fare.
        </p>
        <button
          type="button"
          onClick={addCity}
          disabled={cities.length >= 12}
          className="btn-outline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add city
        </button>
      </div>
    </div>
  );
}

export function AdminTourForm({
  tour,
  experienceOptions,
  destinationOptions,
}: {
  tour?: AdminTour;
  experienceOptions: ExperienceOption[];
  destinationOptions: DestinationOption[];
}) {
  const [pageTitle, setPageTitle] = useState(tour?.title ?? "");
  return (
    <AdminAuthoringForm submitLabel={tour ? "Save changes" : "Create package"} action={saveTourAction} cancel={
      <Link href="/admin/tours" className="btn-outline">Cancel</Link>
    }>
      <input type="hidden" name="id" value={tour?._id ?? ""} />

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">
          Package details
        </h2>

        <div className="admin-details-layout">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="field-label">
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                value={pageTitle}
                maxLength={190}
                onChange={(event) => setPageTitle(event.target.value)}
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <AdminPageUrl prefix="/tours/" title={pageTitle} savedSlug={tour?.slug} />
            </div>

            <DestinationPicker options={destinationOptions} initial={tour && {
              slug: tour.destinationSlug, name: tour.destinationName, region: tour.region,
            }} />

            <div>
              <label htmlFor="badge" className="field-label">
                Badge
              </label>
              <input
                id="badge"
                name="badge"
                defaultValue={tour?.badge ?? ""}
                placeholder="Best Seller"
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <AdminRichField name="summary" label="Short summary"
                initial={tour?.summary} editor={tour?.richFields?.summary} />
            </div>
          </div>
          <div className="min-w-0">
            <CoverPhotoField initialValue={tour?.image} />
          </div>
        </div>
      </section>

      <AdminContentEditor initialBlocks={tour?.contentBlocks} />

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">
          Trip details & pricing
        </h2>

        <div className="admin-detail-groups">
          <div className="admin-detail-group">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="nights" className="field-label">Nights</label>
                <input id="nights" name="nights" type="number" min="0"
                  defaultValue={tour?.nights ?? 5} className="field" />
              </div>
              <div>
                <label htmlFor="days" className="field-label">Days</label>
                <input id="days" name="days" type="number" min="1"
                  defaultValue={tour?.days ?? 6} className="field" />
              </div>
              <div>
                <label htmlFor="groupSize" className="field-label">Group size</label>
                <input id="groupSize" name="groupSize" defaultValue={tour?.groupSize ?? ""}
                  placeholder="16–26 guests" className="field" />
              </div>
            </div>
          </div>

          <div className="admin-detail-group">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="price" className="field-label">Adult price (INR)</label>
                <input id="price" name="price" type="number" min="0" required
                  defaultValue={tour?.price ?? 0} className="field" />
                <p className="admin-field-hint">12 years and up.</p>
              </div>
              <div>
                <label htmlFor="childPrice" className="field-label">Child price (INR)</label>
                <input id="childPrice" name="childPrice" type="number" min="0"
                  defaultValue={tour?.childPrice ?? (tour ? Math.round(tour.price * 0.75) : "")}
                  className="field" />
                <p className="admin-field-hint">Ages 5–11. Blank uses 75% of adult.</p>
              </div>
              <div>
                <label htmlFor="infantPrice" className="field-label">Infant price (INR)</label>
                <input id="infantPrice" name="infantPrice" type="number" min="0"
                  defaultValue={tour?.infantPrice ?? 0} className="field" />
                <p className="admin-field-hint">Under 5. 0 keeps infants free.</p>
              </div>
              <div>
                <label htmlFor="oldPrice" className="field-label">Old price (INR)</label>
                <input id="oldPrice" name="oldPrice" type="number" min="0"
                  defaultValue={tour?.oldPrice ?? ""} className="field" />
                <p className="admin-field-hint">Shown struck through. Optional.</p>
              </div>
            </div>
          </div>

          <div className="admin-detail-group">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="rating" className="field-label">Rating</label>
                <input id="rating" name="rating" type="number" min="0" max="5" step="0.1"
                  defaultValue={tour?.rating ?? 4.8} className="field" />
                <p className="admin-field-hint">Out of 5.</p>
              </div>
              <div>
                <label htmlFor="reviews" className="field-label">Reviews</label>
                <input id="reviews" name="reviews" type="number" min="0"
                  defaultValue={tour?.reviews ?? 0} className="field" />
                <p className="admin-field-hint">Number of reviews.</p>
              </div>
              <div className="sm:pt-7">
                <AdminCheckbox name="featured" defaultChecked={Boolean(tour?.featured)}
                  label="Feature on the home page" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">
          Where travellers can join
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          These cities appear in the departure-city dropdown on the package
          page and on the booking form for this package.
        </p>
        <DepartureCitiesEditor
          initial={tour?.departureCities ?? defaultTourCities}
        />
      </section>

      <AdminTourAddons initial={tour?.addons} />

      <section className="admin-form-panel">
        <h2 className="text-base font-medium text-(--studio-text)">
          Highlights & inclusions
        </h2>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <AdminHighlightsField initial={tour?.highlights} />
          </div>
          <div>
            <AdminHighlightsField name="inclusions" label="Inclusions" itemLabel="inclusion"
              initial={tour?.inclusions} />
          </div>
          <div>
            <AdminHighlightsField name="exclusions" label="Exclusions" itemLabel="exclusion"
              initial={tour?.exclusions} />
          </div>
        </div>
      </section>

      <AdminTourExperiences options={experienceOptions} selected={tour?.experiences} />
      <AdminItineraryEditor initialDays={tour?.itinerary} />

    </AdminAuthoringForm>
  );
}
