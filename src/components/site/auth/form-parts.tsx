"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { PASSWORD_HINT, passwordScore } from "@/lib/auth-rules";
import { cn } from "@/lib/utils";

export function SubmitButton({
  pending,
  pendingLabel,
  className,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn("btn btn-primary btn-lg w-full", className)}
    >
      {pending ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColors = [
  "bg-sand-300",
  "bg-danger",
  "bg-gold-400",
  "bg-blue-500",
  "bg-success",
];

/** Live hint under a new-password field. */
export function PasswordStrength({ password, id }: { password: string; id: string }) {
  const score = passwordScore(password);
  if (!password) {
    return (
      <p id={id} className="field-hint">
        {PASSWORD_HINT}
      </p>
    );
  }
  return (
    <div id={id} className="mt-2.5" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              step <= score ? strengthColors[score] : "bg-sand-300",
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[13px] font-medium leading-5 text-navy-600">
        <span className="font-semibold text-ink">{strengthLabels[score]}.</span>{" "}
        {score < 2 ? PASSWORD_HINT : score < 4 ? "Longer, or add a symbol, to make it stronger." : "Nice one."}
      </p>
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-sand-300" />
      <span className="text-xs font-semibold text-navy-500">{label}</span>
      <span className="h-px flex-1 bg-sand-300" />
    </div>
  );
}

/**
 * "Check your inbox" panel with a rate-limited resend button.
 * Used after sign-up, unverified sign-in and on the verify page.
 */
export function CheckInbox({
  email,
  title = "Check your inbox",
  callbackURL,
  backHref,
  backLabel = "Back to sign in",
  children,
}: {
  email: string;
  title?: string;
  callbackURL: string;
  backHref: string;
  backLabel?: string;
  children?: ReactNode;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function resend() {
    setState("sending");
    setError("");
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL });
    if (error) {
      setError(authErrorMessage(error));
      setState("idle");
      return;
    }
    setState("sent");
  }

  return (
    <div>
      <div className="rounded-[18px] border border-sand-300 bg-sand-100 p-5" role="status">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold-400">
          <MailCheck className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="type-h4 mt-4 text-ink">{title}</h2>
        <p className="type-small mt-2 text-navy-700">
          {children ?? (
            <>
              We sent a confirmation link to{" "}
              <span className="font-semibold text-ink">{email}</span>. Open it
              to finish setting up your account. The link works for 24 hours.
            </>
          )}
        </p>
        <p className="mt-3 text-[13px] font-medium text-navy-600">
          Nothing arrived? Check spam, or{" "}
          <button
            type="button"
            onClick={resend}
            disabled={state !== "idle"}
            className="font-semibold text-blue-700 underline-offset-4 hover:text-blue-800 hover:underline disabled:cursor-default disabled:text-navy-500 disabled:no-underline"
          >
            {state === "sending"
              ? "sending…"
              : state === "sent"
                ? "sent again"
                : "send it again"}
          </button>
          .
        </p>
        {error ? <p className="field-error">{error}</p> : null}
      </div>

      <Link href={backHref} className="btn btn-outline btn-lg mt-5 w-full">
        {backLabel}
        <span className="btn-dot">→</span>
      </Link>
    </div>
  );
}
