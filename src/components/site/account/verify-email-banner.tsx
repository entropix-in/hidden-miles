"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function resend() {
    setState("sending");
    setError("");
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/verify-email",
    });
    if (error) {
      setError(authErrorMessage(error));
      setState("idle");
      return;
    }
    setState("sent");
  }

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[18px] border border-gold-300 bg-gold-50 px-5 py-4"
    >
      <MailWarning className="h-5 w-5 shrink-0 text-gold-700" aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-medium text-navy-700">
        <span className="font-semibold text-ink">Confirm your email.</span>{" "}
        We&apos;ll send booking confirmations to{" "}
        <span className="font-semibold text-ink">{email}</span>, so make sure
        it&apos;s yours.
        {error ? <span className="mt-1 block text-danger">{error}</span> : null}
      </p>
      <button
        type="button"
        onClick={resend}
        disabled={state !== "idle"}
        className="btn btn-ink btn-sm"
      >
        {state === "sending"
          ? "Sending…"
          : state === "sent"
            ? "Link sent. Check your inbox"
            : "Send confirmation link"}
      </button>
    </div>
  );
}
