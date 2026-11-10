"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setStatus("sending");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          name: "Newsletter subscriber",
          email,
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-sand-50">
        <Check className="h-4 w-4 text-blue-300" />
        You are on the list. Happy travels!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 backdrop-blur">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-sand-50 outline-none placeholder:text-sand-200/50"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-blue-400 disabled:opacity-70"
        >
          {status === "sending" ? "Joining" : "Subscribe"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {status === "error" ? (
        <p className="mt-2 pl-2 text-xs font-semibold text-blue-200">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </form>
  );
}
