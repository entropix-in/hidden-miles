"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { AuthError } from "@/components/site/auth-card";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { isValidEmail, withNext } from "@/lib/auth-rules";
import { SubmitButton } from "./form-parts";

export function ForgotPasswordForm({
  next,
  error: initialError,
  disabled,
}: {
  next: string;
  error: string;
  disabled: boolean;
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError);
  const [sent, setSent] = useState(false);
  const loginHref = withNext("/login", next);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setPending(true);
    setError("");
    const { error } = await authClient.requestPasswordReset({
      email: email.trim().toLowerCase(),
      redirectTo: withNext("/reset-password", next),
    });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    // Same answer whether or not the account exists.
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <div className="rounded-[18px] border border-sand-300 bg-sand-100 p-5" role="status">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold-400">
            <MailCheck className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="type-h4 mt-4 text-ink">Check your inbox</h2>
          <p className="type-small mt-2 text-navy-700">
            If an account exists for{" "}
            <span className="font-semibold text-ink">{email.trim()}</span>, a
            reset link is on its way. It works for one hour and can be used once.
          </p>
          <p className="mt-3 text-[13px] font-medium text-navy-600">
            Nothing arrived? Check spam, then{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-semibold text-blue-700 underline-offset-4 hover:text-blue-800 hover:underline"
            >
              try again
            </button>
            .
          </p>
        </div>

        <Link href={loginHref} className="btn btn-primary btn-lg mt-5 w-full">
          Back to sign in
          <span className="btn-dot">→</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <AuthError message={error} />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            className="field"
          />
        </div>

        <SubmitButton pending={pending} pendingLabel="Sending…" className={disabled ? "pointer-events-none opacity-55" : undefined}>
          Send reset link
          <span className="btn-dot">→</span>
        </SubmitButton>
      </form>

      <Link
        href={loginHref}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
      >
        Back to sign in
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </>
  );
}
