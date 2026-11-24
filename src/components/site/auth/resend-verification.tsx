"use client";

import { useState, type FormEvent } from "react";
import { AuthError } from "@/components/site/auth-card";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { isValidEmail, withNext } from "@/lib/auth-rules";
import { CheckInbox, SubmitButton } from "./form-parts";

export function ResendVerification({
  next,
  initialEmail,
}: {
  next: string;
  initialEmail: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const callbackURL = `/verify-email?next=${encodeURIComponent(next)}`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setPending(true);
    setError("");
    const { error } = await authClient.sendVerificationEmail({
      email: email.trim().toLowerCase(),
      callbackURL,
    });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <CheckInbox
        email={email.trim()}
        callbackURL={callbackURL}
        backHref={withNext("/login", next)}
      />
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
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            className="field"
          />
        </div>
        <SubmitButton pending={pending} pendingLabel="Sending…">
          Send a new link
          <span className="btn-dot">→</span>
        </SubmitButton>
      </form>
    </>
  );
}
