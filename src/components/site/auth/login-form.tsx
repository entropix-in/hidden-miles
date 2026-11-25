"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { AuthError, AuthNotice } from "@/components/site/auth-card";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { withNext } from "@/lib/auth-rules";
import { CheckInbox, Divider, SubmitButton } from "./form-parts";
import { GoogleSignIn } from "./google-button";

export function LoginForm({
  next,
  initialEmail,
  notice,
  error: initialError,
  disabled,
  google,
}: {
  next: string;
  initialEmail: string;
  notice: string;
  error: string;
  disabled: boolean;
  google: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError);
  const [unverified, setUnverified] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
      rememberMe: remember,
      callbackURL: `/verify-email?next=${encodeURIComponent(next)}`,
    });

    if (error) {
      setPending(false);
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverified(true);
        return;
      }
      setError(authErrorMessage(error));
      return;
    }

    router.replace(next);
    router.refresh();
  }

  if (unverified) {
    return (
      <CheckInbox
        email={email.trim()}
        title="Confirm your email to sign in"
        callbackURL={`/verify-email?next=${encodeURIComponent(next)}`}
        backHref={withNext("/login", next)}
      >
        Your account isn&apos;t confirmed yet. We just sent a fresh link to{" "}
        <span className="font-semibold text-ink">{email.trim()}</span>. Open
        it and you&apos;ll be signed in straight away.
      </CheckInbox>
    );
  }

  return (
    <>
      <AuthNotice message={notice} />
      <AuthError message={error} />

      {google && !disabled ? <GoogleSignIn next={next} errorPath="/login" /> : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
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
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <Link
              href={withNext("/forgot-password", next)}
              className="inline-flex min-h-8 items-center text-xs font-semibold text-blue-700 underline-offset-4 transition hover:text-blue-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded accent-ink"
          />
          Keep me signed in on this device
        </label>

        <SubmitButton pending={pending} pendingLabel="Signing in…" className={disabled ? "mt-2 pointer-events-none opacity-55" : "mt-2"}>
          <LockKeyhole className="h-4 w-4" aria-hidden />
          Sign in
        </SubmitButton>
      </form>

      <Divider label="New here?" />

      <Link href={withNext("/signup", next)} className="btn btn-outline btn-lg w-full">
        Create an account
        <span className="btn-dot">→</span>
      </Link>

      <p className="mt-5 text-center text-[13px] font-medium leading-5 text-navy-600">
        Booking for a group? You can add every traveller&apos;s details after
        you sign in.
      </p>
    </>
  );
}
