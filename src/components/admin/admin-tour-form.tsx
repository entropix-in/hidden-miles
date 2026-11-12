"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Save, Trash2, X } from "lucide-react";
import { saveTourAction } from "@/app/admin/actions";
import type { AdminTour } from "@/lib/types";
import type { ItineraryBadge, ItineraryBadgeKind } from "@/data/tours";
import {
  getItineraryBadges,
  itineraryBadgeKindLabels,
} from "@/lib/itinerary";

type Day = {
  day: number;
  title: string;
  description: string;
  badges: ItineraryBadge[];
};

type ExperienceOption = {
  slug: string;
  title: string;
  shortTitle: string;
};

const badgeToneClasses: Record<ItineraryBadgeKind, string> = {
  meal: "border-gold-200 bg-gold-50 text-gold-800",
  stay: "border-blue-200 bg-blue-50 text-blue-800",
  travel: "border-navy-200 bg-navy-50 text-navy-800",
  experience: "border-stone-200 bg-white text-stone-700",
  leisure: "border-sand-300 bg-sand-100 text-stone-600",
};

const badgePresets: ItineraryBadge[] = [
  { label: "Breakfast", kind: "meal" },
  { label: "Lunch", kind: "meal" },
  { label: "Dinner", kind: "meal" },
  { label: "Meals included", kind: "meal" },
  { label: "Tea tasting", kind: "meal" },
  { label: "Overnight stay", kind: "stay" },
  { label: "Houseboat stay", kind: "stay" },
  { label: "Hotel stay", kind: "stay" },
  { label: "Resort stay", kind: "stay" },
  { label: "Transfer", kind: "travel" },
  { label: "Flight", kind: "travel" },
  { label: "Train", kind: "travel" },
  { label: "Drive", kind: "travel" },
  { label: "Sightseeing", kind: "experience" },
  { label: "Guided walk", kind: "experience" },
  { label: "Wildlife safari", kind: "experience" },
  { label: "Boat ride", kind: "experience" },
  { label: "Gondola ride", kind: "experience" },
  { label: "Cultural site", kind: "experience" },
  { label: "Cultural show", kind: "experience" },
  { label: "Free time", kind: "leisure" },
  { label: "At leisure", kind: "leisure" },
];

function DayBadges({
  badges,
  onChange,
}: {
  badges: ItineraryBadge[];
  onChange: (badges: ItineraryBadge[]) => void;
}) {
  const [customLabel, setCustomLabel] = useState("");
  const [customKind, setCustomKind] =
    useState<ItineraryBadgeKind>("experience");

  function addBadge(badge: ItineraryBadge) {
    const label = badge.label.trim();
    if (!label) return;
    if (badges.length >= 8) return;
    if (
      badges.some(
        (item) =>
          item.label.toLowerCase() === label.toLowerCase() &&
          item.kind === badge.kind,
      )
    ) {
      return;
    }
    onChange([...badges, { label, kind: badge.kind }]);
  }

  function removeBadge(index: number) {
    onChange(badges.filter((_, badgeIndex) => badgeIndex !== index));
  }

  return (
    <div className="mt-2 rounded-xl border border-stone-200 bg-white p-3">
      <input
        type="hidden"
        name="itineraryBadges"
        value={JSON.stringify(badges)}
      />

      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-stone-400">
        Day badges
      </p>

      {badges.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((badge, badgeIndex) => (
            <span
              key={`${badge.label}-${badgeIndex}`}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${badgeToneClasses[badge.kind]}`}
            >
              {badge.label}
              <button
                type="button"
                onClick={() => removeBadge(badgeIndex)}
                aria-label={`Remove ${badge.label} badge`}
                className="grid h-3.5 w-3.5 place-items-center rounded-full transition hover:bg-black/10"
              >
                <X className="h-2.5 w-2.5" strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1.5 text-sm text-stone-400">
          No badges yet. Leave empty to auto-detect from the description.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <select
          value=""
          onChange={(event) => {
            const preset = badgePresets.find(
              (item) =>
                `${item.kind}:${item.label}` === event.target.value,
            );
            if (preset) addBadge(preset);
            event.target.value = "";
          }}
          aria-label="Add a preset badge"
          className="field h-10 w-full py-0 text-sm sm:w-48"
        >
          <option value="">Add a badge…</option>
          {(Object.keys(itineraryBadgeKindLabels) as ItineraryBadgeKind[]).map(
            (kind) => (
              <optgroup key={kind} label={itineraryBadgeKindLabels[kind]}>
                {badgePresets
                  .filter((preset) => preset.kind === kind)
                  .map((preset) => (
                    <option
                      key={`${kind}:${preset.label}`}
                      value={`${kind}:${preset.label}`}
                    >
                      {preset.label}
                    </option>
                  ))}
              </optgroup>
            ),
          )}
        </select>

        <input
          value={customLabel}
          onChange={(event) => setCustomLabel(event.target.value)}
          placeholder="Custom badge"
          aria-label="Custom badge label"
          maxLength={40}
          className="field h-10 min-w-36 flex-1 py-0 text-sm"
        />
        <select
          value={customKind}
          onChange={(event) =>
            setCustomKind(event.target.value as ItineraryBadgeKind)
          }
          aria-label="Custom badge type"
          className="field h-10 w-full py-0 text-sm sm:w-40"
        >
          {(Object.keys(itineraryBadgeKindLabels) as ItineraryBadgeKind[]).map(
            (kind) => (
              <option key={kind} value={kind}>
                {itineraryBadgeKindLabels[kind]}
              </option>
            ),
          )}
        </select>
        <button
          type="button"
          onClick={() => {
            addBadge({ label: customLabel, kind: customKind });
            setCustomLabel("");
          }}
          disabled={!customLabel.trim() || badges.length >= 8}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-stone-200 bg-sand-50 px-4 text-sm font-extrabold uppercase tracking-wider text-navy-950 transition hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}


export function AdminTourForm({
  tour,
  experienceOptions,
}: {
  tour?: AdminTour;
  experienceOptions: ExperienceOption[];
}) {
  const [itinerary, setItinerary] = useState<Day[]>(
    tour?.itinerary?.length
      ? tour.itinerary.map((day) => ({
          day: day.day,
          title: day.title,
          description: day.description,
          badges: getItineraryBadges(day),
        }))
      : [{ day: 1, title: "", description: "", badges: [] }],
  );

  function updateDay(
    index: number,
    field: "day" | "title" | "description",
    value: string,
  ) {
    setItinerary((days) =>
      days.map((day, dayIndex) =>
        dayIndex === index
          ? {
              ...day,
              [field]: field === "day" ? Number(value) || 1 : value,
            }
          : day,
      ),
    );
  }

  function updateDayBadges(index: number, badges: ItineraryBadge[]) {
    setItinerary((days) =>
      days.map((day, dayIndex) =>
        dayIndex === index ? { ...day, badges } : day,
      ),
    );
  }

  function addDay() {
    setItinerary((days) => [
      ...days,
      { day: days.length + 1, title: "", description: "", badges: [] },
    ]);
  }

  function removeDay(index: number) {
    setItinerary((days) =>
      days
        .filter((_, dayIndex) => dayIndex !== index)
        .map((day, dayIndex) => ({ ...day, day: dayIndex + 1 })),
    );
  }

  return (
    <form action={saveTourAction} className="space-y-5">
      <input type="hidden" name="id" value={tour?._id ?? ""} />

      <section className="rounded-[28px] border border-stone-200 bg-white p-6">
        <p className="eyebrow">The basics</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950">
          Package details
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="field-label">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={tour?.title ?? ""}
              placeholder="Magical Kashmir"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="slug" className="field-label">
              URL slug
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={tour?.slug ?? ""}
              placeholder="magical-kashmir"
              className="field"
            />
            <p className="mt-1.5 text-sm text-stone-400">
              Leave blank to generate from the title.
            </p>
          </div>

          <div>
            <label htmlFor="image" className="field-label">
              Cover image URL
            </label>
            <input
              id="image"
              name="image"
              defaultValue={tour?.image ?? ""}
              placeholder="https://images.unsplash.com/..."
              className="field"
            />
          </div>

          <div>
            <label htmlFor="destinationSlug" className="field-label">
              Destination slug
            </label>
            <input
              id="destinationSlug"
              name="destinationSlug"
              required
              defaultValue={tour?.destinationSlug ?? ""}
              placeholder="kashmir"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="destinationName" className="field-label">
              Destination name
            </label>
            <input
              id="destinationName"
              name="destinationName"
              defaultValue={tour?.destinationName ?? ""}
              placeholder="Kashmir"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="region" className="field-label">
              Region
            </label>
            <select
              id="region"
              name="region"
              defaultValue={tour?.region ?? "India"}
              className="field"
            >
              <option value="India">India</option>
              <option value="International">International</option>
            </select>
          </div>

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
            <label htmlFor="summary" className="field-label">
              Short summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              defaultValue={tour?.summary ?? ""}
              placeholder="A gentle, beautiful introduction to the valley..."
              className="field resize-none"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6">
        <p className="eyebrow">Pricing & departures</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950">
          Numbers & details
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="nights" className="field-label">
              Nights
            </label>
            <input
              id="nights"
              name="nights"
              type="number"
              min="0"
              defaultValue={tour?.nights ?? 5}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="days" className="field-label">
              Days
            </label>
            <input
              id="days"
              name="days"
              type="number"
              min="1"
              defaultValue={tour?.days ?? 6}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="price" className="field-label">
              Price (INR)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              required
              defaultValue={tour?.price ?? 0}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="oldPrice" className="field-label">
              Old price
            </label>
            <input
              id="oldPrice"
              name="oldPrice"
              type="number"
              min="0"
              defaultValue={tour?.oldPrice ?? ""}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="rating" className="field-label">
              Rating
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              defaultValue={tour?.rating ?? 4.8}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="reviews" className="field-label">
              Reviews
            </label>
            <input
              id="reviews"
              name="reviews"
              type="number"
              min="0"
              defaultValue={tour?.reviews ?? 0}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="departure" className="field-label">
              Departure
            </label>
            <input
              id="departure"
              name="departure"
              defaultValue={tour?.departure ?? ""}
              placeholder="Every Saturday"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="groupSize" className="field-label">
              Group size
            </label>
            <input
              id="groupSize"
              name="groupSize"
              defaultValue={tour?.groupSize ?? ""}
              placeholder="16–26 guests"
              className="field"
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm font-bold text-navy-950">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={Boolean(tour?.featured)}
            className="h-4 w-4 rounded border-stone-300 text-blue-600"
          />
          Feature this package on the home page
        </label>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6">
        <p className="eyebrow">The story</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950">
          Highlights & inclusions
        </h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label htmlFor="highlights" className="field-label">
              Highlights (one per line)
            </label>
            <textarea
              id="highlights"
              name="highlights"
              rows={5}
              defaultValue={tour?.highlights.join("\n") ?? ""}
              placeholder={"Dal Lake houseboat\nGulmarg gondola"}
              className="field resize-none"
            />
          </div>
          <div>
            <label htmlFor="inclusions" className="field-label">
              Inclusions (one per line)
            </label>
            <textarea
              id="inclusions"
              name="inclusions"
              rows={6}
              defaultValue={tour?.inclusions.join("\n") ?? ""}
              className="field resize-none"
            />
          </div>
          <div>
            <label htmlFor="exclusions" className="field-label">
              Exclusions (one per line)
            </label>
            <textarea
              id="exclusions"
              name="exclusions"
              rows={6}
              defaultValue={tour?.exclusions.join("\n") ?? ""}
              className="field resize-none"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6">
        <p className="eyebrow">Travel styles</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950">
          Experiences included
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {experienceOptions.map((experience) => (
            <label
              key={experience.slug}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-sand-50 px-4 py-2 text-sm font-bold text-stone-600 transition hover:border-blue-400"
            >
              <input
                type="checkbox"
                name="experiences"
                value={experience.slug}
                defaultChecked={tour?.experiences.includes(experience.slug)}
                className="h-3.5 w-3.5 rounded border-stone-300 text-blue-600"
              />
              {experience.shortTitle}
            </label>
          ))}
          {!experienceOptions.length ? (
            <p className="text-sm text-stone-400">
              Add experiences first to tag them on packages.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Day by day</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-navy-950">
              Itinerary
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              Add badges for meals, stay, travel and activities. These appear
              on the public day-by-day timeline.
            </p>
          </div>
          <button
            type="button"
            onClick={addDay}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-sand-50 px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-navy-950 transition hover:border-blue-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Add day
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {itinerary.map((day, index) => (
            <div
              key={index}
              className="rounded-2xl border border-stone-200 bg-sand-50 p-4"
            >
              <div className="flex items-center gap-3">
                <input
                  name="itineraryDay"
                  type="number"
                  min="1"
                  value={day.day}
                  onChange={(event) =>
                    updateDay(index, "day", event.target.value)
                  }
                  aria-label={`Day number for itinerary row ${index + 1}`}
                  className="field h-10 w-16 shrink-0 px-2 text-center"
                />
                <input
                  name="itineraryTitle"
                  value={day.title}
                  onChange={(event) =>
                    updateDay(index, "title", event.target.value)
                  }
                  placeholder="Arrive Srinagar · Dal Lake"
                  aria-label={`Day title for itinerary row ${index + 1}`}
                  className="field h-10 flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeDay(index)}
                  aria-label="Remove day"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-stone-200 bg-white text-stone-400 transition hover:border-red-200 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                name="itineraryDescription"
                value={day.description}
                onChange={(event) =>
                  updateDay(index, "description", event.target.value)
                }
                placeholder="What happens on this day?"
                aria-label={`Day description for itinerary row ${index + 1}`}
                rows={2}
                className="field mt-2 resize-none"
              />
              <DayBadges
                badges={day.badges}
                onChange={(badges) => updateDayBadges(index, badges)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-stone-200 bg-white px-6 py-4">
        <Link href="/admin/tours" className="btn-outline">
          Cancel
        </Link>
        <button type="submit" className="btn-primary">
          <Save className="h-4 w-4" />
          {tour ? "Save changes" : "Create package"}
        </button>
      </div>
    </form>
  );
}
