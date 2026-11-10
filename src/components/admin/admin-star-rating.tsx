"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminStarRating({
  name = "rating",
  defaultValue = 5,
  label = "Rating",
}: {
  name?: string;
  defaultValue?: number;
  label?: string;
}) {
  const [value, setValue] = useState(
    Math.min(5, Math.max(1, Math.round(defaultValue))),
  );
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      <span className="field-label">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap items-center gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (hovered || value) >= star;

          return (
            <label
              key={star}
              onMouseEnter={() => setHovered(star)}
              className="cursor-pointer rounded-md p-0.5"
            >
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => setValue(star)}
                className="peer sr-only"
              />
              <Star
                className={cn(
                  "h-8 w-8 transition duration-150 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500",
                  active
                    ? "fill-gold-400 text-gold-400"
                    : "fill-transparent text-stone-300",
                )}
              />
              <span className="sr-only">
                {star} {star === 1 ? "star" : "stars"}
              </span>
            </label>
          );
        })}
        <span className="ml-2 text-sm font-extrabold text-navy-950">
          {value}.0 / 5
        </span>
      </div>
    </div>
  );
}
