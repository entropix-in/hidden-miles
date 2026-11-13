"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const interests = [
  "Group tour",
  "Speciality tour",
  "Personalised holiday",
  "Corporate travel",
  "Something else",
];

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interest: "Group tour",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "enquiry",
          source: "/contact",
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: `Interested in: ${form.interest}. ${form.message}`,
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
      <div className="rounded-[28px] border border-sand-300 bg-paper p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-gold-400">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="type-h3 mt-5 text-ink">Message received.</h2>
        <p className="type-small mx-auto mt-2 max-w-md text-navy-700">
          Thank you, {form.name.split(" ")[0] || "traveller"}. We usually reply
          within the hour, Monday to Saturday.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setForm((current) => ({ ...current, message: "" }));
          }}
          className="btn btn-outline mt-6"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[28px] border border-sand-300 bg-paper p-7 md:p-10"
    >
      <h2 className="type-h3 text-ink">Send us a message</h2>
      <p className="type-small mt-2 text-navy-500">
        We usually reply within the hour, Monday to Saturday.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Full name
          </label>
          <input
            id="contact-name"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="field-label">
            Phone
          </label>
          <input
            id="contact-phone"
            required
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+91"
            inputMode="tel"
            autoComplete="tel"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="contact-interest" className="field-label">
            I&apos;m interested in
          </label>
          <select
            id="contact-interest"
            value={form.interest}
            onChange={(event) => update("interest", event.target.value)}
            className="field"
          >
            {interests.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="field-label">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Where and when would you like to travel?"
          className="field resize-none"
        />
      </div>

      {status === "error" ? (
        <p className="mt-4 text-sm font-semibold text-danger">
          Something went wrong. Please call us on +91 98204 12345.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] font-medium text-navy-500">
          We never share your details.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-ink btn-lg disabled:opacity-60"
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send message
          <span className="btn-dot">→</span>
        </button>
      </div>
    </form>
  );
}
