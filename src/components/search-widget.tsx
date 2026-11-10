"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Compass,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";

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

export function SearchWidget({ className }: { className?: string }) {
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
      className={
        "rounded-[28px] border border-white/50 bg-white/95 p-3 shadow-2xl shadow-forest-950/15 backdrop-blur-xl sm:p-4 " +
        (className ?? "")
      }
    >
      <div className="grid gap-2 lg:grid-cols-[1.25fr_1.1fr_1fr_0.8fr_auto]">
        <label className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-cream-100">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700">
            <MapPin className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
              Destination
            </span>
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              aria-label="Destination"
              className="mt-0.5 w-full cursor-pointer appearance-none bg-transparent text-sm font-bold text-forest-950 outline-none"
            >
              <option value="">Anywhere beautiful</option>
              {destinations.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-stone-400" />
        </label>

        <label className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-cream-100">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 text-forest-700">
            <Compass className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
              Travel style
            </span>
            <select
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              aria-label="Travel style"
              className="mt-0.5 w-full cursor-pointer appearance-none bg-transparent text-sm font-bold text-forest-950 outline-none"
            >
              <option value="">All experiences</option>
              {experiences.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.shortTitle}
                </option>
              ))}
            </select>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-stone-400" />
        </label>

        <label className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-cream-100">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-saffron-100 text-saffron-700">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
              When
            </span>
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              aria-label="Travel month"
              className="mt-0.5 w-full cursor-pointer appearance-none bg-transparent text-sm font-bold text-forest-950 outline-none"
            >
              {months.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-stone-400" />
        </label>

        <label className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-cream-100">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-100 text-forest-700">
            <Users className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
              Travellers
            </span>
            <select
              value={travellers}
              onChange={(event) => setTravellers(event.target.value)}
              aria-label="Number of travellers"
              className="mt-0.5 w-full cursor-pointer appearance-none bg-transparent text-sm font-bold text-forest-950 outline-none"
            >
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map(
                (item) => (
                  <option key={item} value={item}>
                    {item} {item === "1" ? "traveller" : "travellers"}
                  </option>
                ),
              )}
            </select>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-stone-400" />
        </label>

        <button type="submit" className="btn-primary h-full min-h-14 lg:px-7">
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </form>
  );
}
