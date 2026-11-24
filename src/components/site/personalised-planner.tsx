"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";

const styles = [
  "Honeymoon",
  "Family",
  "Adventure",
  "Slow & relaxed",
  "Luxury",
  "Spiritual",
];

const monthOptions = [
  "Flexible",
  "December 2026",
  "January 2027",
  "February 2027",
  "March 2027",
  "April 2027",
  "May 2027",
  "June 2027",
  "July 2027",
  "August 2027",
  "September 2027",
  "October 2027",
  "November 2027",
  "December 2027",
];

const durationOptions = [
  "3–5 days",
  "6–8 days",
  "7–9 days",
  "10–14 days",
  "15+ days",
];

export function PersonalisedPlanner() {
  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState({
    destination: "",
    when: "December 2026",
    duration: "7–9 days",
    style: "Family",
  });
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "enquiry",
          source: "/personalised",
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          destination: trip.destination,
          travelMonth: trip.when,
          travellers: "2",
          message: `Trip style: ${trip.style}. Duration: ${trip.duration}. ${contact.message}`,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStep(3);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="w-full max-w-[520px] rounded-[28px] border border-sand-300 bg-paper p-8 shadow-[0_24px_56px_-32px_rgba(11,39,53,0.25)] md:p-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-h3 text-ink">Start planning</h2>
        {step < 3 ? (
          <span className="text-sm font-semibold text-navy-500">
            Step {step + 1} of 3
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((bar) => (
          <span
            key={bar}
            className={cn(
              "h-1 flex-1 rounded-full",
              bar <= step ? "bg-gold-400" : "bg-sand-200",
            )}
          />
        ))}
      </div>

      {step === 3 ? (
        <div className="mt-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-gold-400">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h3 className="type-h3 mt-5 text-ink">Your brief is with us.</h3>
          <p className="type-small mt-2 text-navy-700">
            A Hidden Miles specialist will send your first itinerary within 24
            hours. Keep an eye on {contact.email || "your inbox"}.
          </p>
        </div>
      ) : step === 0 ? (
        <form
          className="mt-6 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setStep(1);
          }}
        >
          <div>
            <label htmlFor="planner-destination" className="field-label">
              Where would you like to go?
            </label>
            <input
              id="planner-destination"
              value={trip.destination}
              onChange={(event) =>
                setTrip((current) => ({ ...current, destination: event.target.value }))
              }
              placeholder="Kerala, Bali, Japan…"
              className="field h-[60px] py-4 leading-[27px]"
            />
            <p className="field-hint">
              Not sure yet? Leave it blank.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="planner-when" className="field-label">
                When
              </label>
              <Select
                id="planner-when"
                value={trip.when}
                onValueChange={(next) =>
                  setTrip((current) => ({
                    ...current,
                    when: next,
                  }))
                }
                className="h-[60px] py-4 pr-12 leading-[27px]"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {/* Short month keeps "Dec 2026" from truncating in the half-width field. */}
                    {month.replace(/^(\w{3})\w*/, "$1")}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="planner-duration" className="field-label">
                How long
              </label>
              <Select
                id="planner-duration"
                value={trip.duration}
                onValueChange={(next) =>
                  setTrip((current) => ({
                    ...current,
                    duration: next,
                  }))
                }
                className="h-[60px] py-4 pr-12 leading-[27px]"
              >
                {durationOptions.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <p className="field-label mb-0">Trip style</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTrip((current) => ({ ...current, style }))}
                  className={cn(
                    "chip px-5 py-2.5",
                    trip.style === style && "chip-active",
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-ink btn-lg w-full">
            Continue
            <span className="btn-dot">→</span>
          </button>
          <p className="text-center text-[13px] font-medium text-navy-500">
            Takes 2 minutes · no payment needed
          </p>
        </form>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="planner-name" className="field-label">
              Your name
            </label>
            <input
              id="planner-name"
              required
              value={contact.name}
              onChange={(event) =>
                setContact((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Your name"
              autoComplete="name"
              className="field"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="planner-email" className="field-label">
                Email
              </label>
              <input
                id="planner-email"
                type="email"
                required
                value={contact.email}
                onChange={(event) =>
                  setContact((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="you@email.com"
                autoComplete="email"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="planner-phone" className="field-label">
                Phone
              </label>
              <input
                id="planner-phone"
                required
                value={contact.phone}
                onChange={(event) =>
                  setContact((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="+91"
                autoComplete="tel"
                className="field"
              />
            </div>
          </div>
          <div>
            <label htmlFor="planner-message" className="field-label">
              Anything else we should know?
            </label>
            <textarea
              id="planner-message"
              rows={3}
              value={contact.message}
              onChange={(event) =>
                setContact((current) => ({ ...current, message: event.target.value }))
              }
              placeholder="Who is travelling, what you love, anything to avoid…"
              className="field resize-none"
            />
          </div>

          {status === "error" ? (
            <p className="text-sm font-semibold text-danger">
              Something went wrong. Please try again or call us.
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="btn btn-outline"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn btn-ink flex-1 disabled:opacity-60"
            >
              {status === "sending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Send my brief
              <span className="btn-dot">→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
