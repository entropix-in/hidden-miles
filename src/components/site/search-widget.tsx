"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Compass, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
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

const inlineTriggerClassName =
  "flex w-full cursor-pointer items-center justify-between gap-2 bg-transparent text-left text-[15px] font-bold text-ink outline-none";

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
            <span className="type-label block text-navy-500">
              Where to
            </span>
            <span className="relative mt-1 block">
              <Select
                value={destination}
                onValueChange={setDestination}
                aria-label="Destination"
                triggerClassName={inlineTriggerClassName}
              >
                <option value="">Search destinations</option>
                {destinations.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </span>
          </span>
        </label>

        <span className="route-line my-1 hidden lg:block lg:h-11 lg:w-0 lg:border-l lg:border-t-0" />

        <label className="group flex flex-1 items-center gap-3 rounded-[16px] px-4 py-3 transition hover:bg-sand-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-ink">
            <CalendarDays className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-label block text-navy-500">When</span>
            <span className="relative mt-1 block">
              <Select
                value={month}
                onValueChange={setMonth}
                aria-label="Travel month"
                triggerClassName={inlineTriggerClassName}
              >
                {months.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </span>
          </span>
        </label>

        <span className="route-line my-1 hidden lg:block lg:h-11 lg:w-0 lg:border-l lg:border-t-0" />

        <label className="group flex flex-1 items-center gap-3 rounded-[16px] px-4 py-3 transition hover:bg-sand-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-ink">
            <Compass className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-label block text-navy-500">
              Trip style
            </span>
            <span className="relative mt-1 block">
              <Select
                value={experience}
                onValueChange={setExperience}
                aria-label="Travel style"
                triggerClassName={inlineTriggerClassName}
              >
                <option value="">Group tour</option>
                {experiences.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.shortTitle}
                  </option>
                ))}
              </Select>
            </span>
          </span>
        </label>

        <span className="route-line my-1 hidden lg:block lg:h-11 lg:w-0 lg:border-l lg:border-t-0" />

        <label className="group flex flex-1 items-center gap-3 rounded-[16px] px-4 py-3 transition hover:bg-sand-100">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-ink">
            <Users className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="type-label block text-navy-500">
              Travellers
            </span>
            <span className="relative mt-1 block">
              <Select
                value={travellers}
                onValueChange={setTravellers}
                aria-label="Number of travellers"
                triggerClassName={inlineTriggerClassName}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map(
                  (item) => (
                    <option key={item} value={item}>
                      {item} {item === "1" ? "adult" : "adults"}
                    </option>
                  ),
                )}
              </Select>
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
