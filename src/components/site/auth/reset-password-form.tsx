"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { AuthError } from "@/components/site/auth-card";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { passwordProblem, withNext } from "@/lib/auth-rules";
import { FieldError, PasswordStrength, SubmitButton } from "./form-parts";

export function ExpiredResetLink({ next }: { next: string }) {
  return (
    <>
      <div className="rounded-[14px] border border-sand-300 bg-sand-100 p-5">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-gold-400">
          <KeyRound className="h-5 w-5" aria-hidden />
        </span>
        <p className="type-small mt-4 text-navy-700">
          Reset links work for one hour and can only be used once. Request a
          fresh one and we will email it straight away.
        </p>
      </div>

      <Link href={withNext("/forgot-password", next)} className="btn btn-primary btn-lg mt-5 w-full">
        Request a new link
        <span className="btn-dot">→</span>
      </Link>
      <Link
        href={withNext("/login", next)}
        className="mt-4 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
      >
        Back to sign in
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </>
  );
}

export function ResetPasswordForm({ token, next }: { token: string; next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  const passwordError = submitted ? passwordProblem(password) : "";
  const confirmError =
    submitted && confirm !== password ? "Those passwords do not match." : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (passwordProblem(password) || confirm !== password) return;

    setPending(true);
    setError("");
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) {
      setPending(false);
      if (error.code === "INVALID_TOKEN") {
        setExpired(true);
        return;
      }
      setError(authErrorMessage(error));
      return;
    }

    const params = new URLSearchParams({
      notice: "Your password has been updated. Sign in with your new password.",
    });
    if (next !== "/account") params.set("next", next);
    router.replace(`/login?${params.toString()}`);
  }

  if (expired) return <ExpiredResetLink next={next} />;

  return (
    <>
      <AuthError message={error} />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="field-label">
            New password
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={passwordError ? true : undefined}
            aria-describedby="password-strength"
          />
          {passwordError && !password ? (
            <FieldError id="password-strength" message={passwordError} />
          ) : (
            <PasswordStrength id="password-strength" password={password} />
          )}
        </div>

        <div>
          <label htmlFor="confirm-password" className="field-label">
            Confirm new password
          </label>
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Type it once more"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={confirmError ? true : undefined}
            aria-describedby={confirmError ? "confirm-error" : undefined}
          />
          <FieldError id="confirm-error" message={confirmError} />
        </div>

        <SubmitButton pending={pending} pendingLabel="Updating…">
          <KeyRound className="h-4 w-4" aria-hidden />
          Update my password
        </SubmitButton>
        <p className="text-center text-xs font-medium text-navy-500">
          This signs you out on every other device.
        </p>
      </form>

      <Link
        href={withNext("/login", next)}
        className="mt-5 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
      >
        Back to sign in
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </>
  );
}
