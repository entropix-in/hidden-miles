"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export function CorporateProposalForm() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    groupSize: "",
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
          type: "corporate",
          source: "/corporate",
          name: form.name,
          email: form.email,
          phone: "",
          travellers: form.groupSize,
          message: `${form.company ? `${form.company}: ` : ""}${form.message}`,
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
      <div className="rounded-[28px] border border-sand-300 bg-paper p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-gold-400">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="type-h3 mt-5 text-ink">Request received.</h3>
        <p className="type-small mt-2 text-navy-700">
          Our corporate team will reply within one working day with a proposal.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="w-full rounded-[28px] border border-sand-300 bg-sand-100 p-8 md:p-10"
    >
      <h2 className="type-h3 text-ink">Request a proposal</h2>
      <p className="type-small mt-2 text-navy-500">
        We reply within one working day.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="corp-name" className="field-label">
            Your name
          </label>
          <input
            id="corp-name"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Priya Nair"
            autoComplete="name"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="corp-company" className="field-label">
            Company
          </label>
          <input
            id="corp-company"
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            placeholder="Acme Labs"
            autoComplete="organization"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="corp-email" className="field-label">
            Work email
          </label>
          <input
            id="corp-email"
            type="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="priya@acme.com"
            autoComplete="email"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="corp-size" className="field-label">
            Group size
          </label>
          <input
            id="corp-size"
            value={form.groupSize}
            onChange={(event) => update("groupSize", event.target.value)}
            placeholder="80–120"
            className="field"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="corp-message" className="field-label">
          Tell us about the event
        </label>
        <textarea
          id="corp-message"
          rows={4}
          required
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Offsite in Goa, 3 nights, March…"
          className="field resize-none"
        />
      </div>

      {status === "error" ? (
        <p className="mt-4 text-sm font-semibold text-danger">
          Something went wrong. Please email us directly at hello@hiddenmiles.in.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-ink btn-lg mt-6 w-full disabled:opacity-60"
      >
        {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send request
        <span className="btn-dot">→</span>
      </button>
    </form>
  );
}
