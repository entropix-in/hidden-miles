"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { destinations } from "@/data/destinations";
import { cn } from "@/lib/utils";

const months = [
  "Not decided",
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

export function EnquiryForm({
  defaultDestination,
  tourTitle,
  compact = false,
  className,
}: {
  defaultDestination?: string;
  tourTitle?: string;
  compact?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    destination: defaultDestination ?? "",
    travellers: "2",
    month: "Not decided",
    message: "",
    company: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: "enquiry",
          tour: tourTitle ?? "",
          source: pathname,
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div
        className={cn(
          "rounded-3xl border border-forest-200 bg-forest-50 p-8 text-center",
          className,
        )}
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-600 text-white">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold text-forest-950">
          Your holiday is in good hands.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-600">
          Thank you, {form.name.split(" ")[0] || "traveller"}. A Safarnest travel
          expert will call you within one working day with ideas and a tailored
          quote.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setForm((current) => ({ ...current, message: "" }));
          }}
          className="btn-outline mt-6"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-3xl bg-white p-6 sm:p-7", className)}
    >
      {!compact ? (
        <div className="mb-6">
          <p className="eyebrow">Talk to a real traveller</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-forest-950">
            Tell us about your dream trip
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Share a few details and a travel expert will design a holiday around
            you — no obligation, no pressure.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="enquiry-name" className="field-label">
            Full name
          </label>
          <input
            id="enquiry-name"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Your name"
            className="field"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="enquiry-phone" className="field-label">
            Phone number
          </label>
          <input
            id="enquiry-phone"
            required
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+91 98765 43210"
            className="field"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="enquiry-email" className="field-label">
            Email address
          </label>
          <input
            id="enquiry-email"
            type="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@example.com"
            className="field"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="enquiry-destination" className="field-label">
            Destination
          </label>
          <select
            id="enquiry-destination"
            value={form.destination}
            onChange={(event) => update("destination", event.target.value)}
            className="field"
          >
            <option value="">Help me choose</option>
            {destinations.map((destination) => (
              <option key={destination.slug} value={destination.slug}>
                {destination.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="enquiry-travellers" className="field-label">
            Travellers
          </label>
          <select
            id="enquiry-travellers"
            value={form.travellers}
            onChange={(event) => update("travellers", event.target.value)}
            className="field"
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map(
              (item) => (
                <option key={item} value={item}>
                  {item} {item === "1" ? "traveller" : "travellers"}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="enquiry-month" className="field-label">
            When are you thinking of travelling?
          </label>
          <select
            id="enquiry-month"
            value={form.month}
            onChange={(event) => update("month", event.target.value)}
            className="field"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="enquiry-message" className="field-label">
            Anything we should know?
          </label>
          <textarea
            id="enquiry-message"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            rows={compact ? 3 : 4}
            placeholder="Celebrations, must-see places, dietary needs, budget…"
            className="field resize-none"
          />
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="enquiry-company">Company</label>
          <input
            id="enquiry-company"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary mt-5 w-full disabled:opacity-70"
      >
        {status === "sending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {status === "sending" ? "Sending your enquiry" : "Send my enquiry"}
      </button>

      {status === "error" ? (
        <p className="mt-3 text-center text-xs font-semibold text-red-600">
          We could not send that just now. Please call us on +91 98204 12345.
        </p>
      ) : null}

      <p className="mt-4 text-center text-[11px] leading-5 text-stone-400">
        By submitting, you agree to be contacted by a Safarnest travel expert.
        We never share your details.
      </p>
    </form>
  );
}
