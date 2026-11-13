"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Compass,
  MapPin,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Destination } from "@/data/destinations";
import type { Experience } from "@/data/experiences";

const months = [
  "Any month",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function SearchWidget({
  destinations,
  experiences,
  className,
}: {
  destinations: Destination[];
  experiences: Experience[];
  className?: string;
}) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [experience, setExperience] = useState("");
  const [month, setMonth] = useState("Any month");
  const [travellers, setTravellers] = useState("2");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (experience) params.set("experience", experience);
    if (month !== "Any month") params.set("month", month);
    if (travellers) params.set("travellers", travellers);
    router.push(`/tours${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-1 rounded-[24px] border border-sand-300 bg-paper p-2.5 shadow-[0_24px_56px_-36px_rgba(11,39,53,0.35)] lg:flex-row lg:items-center lg:gap-0",
        className,
      )}
    >
      <div className="grid flex-1 gap-1 md:grid-cols-2 lg:flex lg:items-center">
        <label className="group flex flex-1 items-center gap-3 rounded-[16px] px-4 py-3 transition hover:bg-sand-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-ink">
            <MapPin className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-label block text-[11px] text-navy-500">
              Where to
            </span>
            <span className="relative mt-1 block">
              <select
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                aria-label="Destination"
                className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[15px] font-bold text-ink outline-none"
              >
                <option value="">Search destinations</option>
                {destinations.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-400" />
            </span>
          </span>
        </label>

        <span className="route-line my-1 hidden lg:block lg:h-11 lg:w-0 lg:border-l lg:border-t-0" />

        <label className="group flex flex-1 items-center gap-3 rounded-[16px] px-4 py-3 transition hover:bg-sand-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-ink">
            <CalendarDays className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-label block text-[11px] text-navy-500">When</span>
            <span className="relative mt-1 block">
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                aria-label="Travel month"
                className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[15px] font-bold text-ink outline-none"
              >
                {months.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-400" />
            </span>
          </span>
        </label>

        <span className="route-line my-1 hidden lg:block lg:h-11 lg:w-0 lg:border-l lg:border-t-0" />

        <label className="group flex flex-1 items-center gap-3 rounded-[16px] px-4 py-3 transition hover:bg-sand-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-ink">
            <Compass className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-label block text-[11px] text-navy-500">
              Trip style
            </span>
            <span className="relative mt-1 block">
              <select
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                aria-label="Travel style"
                className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[15px] font-bold text-ink outline-none"
              >
                <option value="">Group tour</option>
                {experiences.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.shortTitle}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-400" />
            </span>
          </span>
        </label>

        <span className="route-line my-1 hidden lg:block lg:h-11 lg:w-0 lg:border-l lg:border-t-0" />

        <label className="group flex flex-1 items-center gap-3 rounded-[16px] px-4 py-3 transition hover:bg-sand-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-ink">
            <Users className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-label block text-[11px] text-navy-500">
              Travellers
            </span>
            <span className="relative mt-1 block">
              <select
                value={travellers}
                onChange={(event) => setTravellers(event.target.value)}
                aria-label="Number of travellers"
                className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[15px] font-bold text-ink outline-none"
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map(
                  (item) => (
                    <option key={item} value={item}>
                      {item} {item === "1" ? "adult" : "adults"}
                    </option>
                  ),
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-400" />
            </span>
          </span>
        </label>
      </div>

      <button type="submit" className="btn btn-primary btn-lg mt-1 w-full lg:ml-2 lg:mt-0 lg:w-auto">
        Search trips
        <span className="btn-dot">→</span>
      </button>
    </form>
  );
}
