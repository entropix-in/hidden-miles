"use client";

import { useState } from "react";
import { Check } from "lucide-react";

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
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-paper">
        <Check className="h-4 w-4 text-gold-400" />
        You&apos;re on the list. Happy travels!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] p-1.5">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-paper outline-none placeholder:text-navy-300"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary btn-sm shrink-0 disabled:opacity-60"
        >
          {status === "sending" ? "Joining" : "Subscribe"}
        </button>
      </div>
      {status === "error" ? (
        <p className="mt-2 pl-2 text-sm font-semibold text-gold-300">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </form>
  );
}
