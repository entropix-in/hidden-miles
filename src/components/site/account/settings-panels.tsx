"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle, Monitor, Smartphone } from "lucide-react";
import { AuthError, AuthNotice } from "@/components/site/auth-card";
import { FieldError, PasswordStrength } from "@/components/site/auth/form-parts";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import {
  isValidEmail,
  nameProblem,
  passwordProblem,
  phoneProblem,
} from "@/lib/auth-rules";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  aside,
  children,
  tone = "default",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section className="grid gap-4 border-t border-sand-300 py-6 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10">
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className={cn("type-title", tone === "danger" ? "text-danger" : "text-ink")}>
            {title}
          </h2>
          {aside}
        </div>
        {description ? (
          <p className="type-small mt-1 text-navy-600">{description}</p>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function SaveButton({
  pending,
  children,
  variant = "btn-primary",
}: {
  pending: boolean;
  children: ReactNode;
  variant?: string;
}) {
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={cn("btn", variant)}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {pending ? "Saving…" : children}
    </button>
  );
}

/* ------------------------------------------------------------ profile */

export function ProfilePanel({ name, phone }: { name: string; phone: string }) {
  const router = useRouter();
  const [values, setValues] = useState({ name, phone });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const nameError = nameProblem(values.name);
  const phoneError = phoneProblem(values.phone);
  const dirty = values.name.trim() !== name || values.phone.trim() !== phone;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameError || phoneError) {
      setError(nameError || phoneError);
      return;
    }
    setPending(true);
    setError("");
    setNotice("");
    const { error } = await authClient.updateUser({
      name: values.name.trim(),
      phone: values.phone.trim(),
    });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error, "We could not save your details. Please try again."));
      return;
    }
    setNotice("Your details have been updated.");
    router.refresh();
  }

  return (
    <Panel
      title="Personal details"
      description="Used on your bookings"
    >
      <AuthNotice message={notice} />
      <AuthError message={error} />
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div>
          <label htmlFor="profile-name" className="field-label">
            Full name
          </label>
          <input
            id="profile-name"
            autoComplete="name"
            maxLength={120}
            value={values.name}
            onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
            aria-invalid={nameError ? true : undefined}
            className="field"
          />
          <FieldError id="profile-name-error" message={nameError} />
        </div>
        <div>
          <label htmlFor="profile-phone" className="field-label">
            Phone <span className="font-medium text-navy-500">(optional)</span>
          </label>
          <input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            placeholder="+91"
            value={values.phone}
            onChange={(event) => setValues((v) => ({ ...v, phone: event.target.value }))}
            aria-invalid={phoneError ? true : undefined}
            className="field"
          />
          <FieldError id="profile-phone-error" message={phoneError} />
        </div>
        <div className="flex justify-end sm:col-span-2">
          <SaveButton pending={pending} variant={dirty ? "btn-primary" : "btn-light"}>
            {dirty ? "Save changes" : "Saved"}
          </SaveButton>
        </div>
      </form>
    </Panel>
  );
}

/* -------------------------------------------------------------- email */

export function EmailPanel({
  email,
  emailVerified,
  needsApproval,
}: {
  email: string;
  emailVerified: boolean;
  needsApproval: boolean;
}) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = newEmail.trim().toLowerCase();
    if (!isValidEmail(target)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (target === email) {
      setError("That's already your email address.");
      return;
    }
    setPending(true);
    setError("");
    setNotice("");
    const { error } = await authClient.changeEmail({
      newEmail: target,
      callbackURL: "/account/settings?notice=email",
    });
    setPending(false);
    if (error) {
      setError(
        error.code?.includes("EXIST")
          ? "That email address is already linked to another account."
          : authErrorMessage(error),
      );
      return;
    }
    setNewEmail("");
    if (needsApproval) {
      setNotice(
        emailVerified
          ? `We sent an approval link to ${email}. Once approved, we'll confirm ${target} too.`
          : `We sent a confirmation link to ${target}. Open it to finish the change.`,
      );
    } else {
      setNotice("Your email address has been updated.");
      router.refresh();
    }
  }

  return (
    <Panel
      title="Email"
      description="For confirmations and trip updates"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="min-w-0 truncate text-sm font-semibold text-ink">{email}</span>
        <span className={emailVerified ? "badge badge-success" : "badge badge-gold"}>
          {emailVerified ? "Confirmed" : "Not confirmed"}
        </span>
      </div>
      <AuthNotice message={notice} />
      <AuthError message={error} />
      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="new-email" className="field-label">
          Change email
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="new-email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            className="field flex-1"
          />
          <SaveButton pending={pending} variant="btn-outline">
            Send link
          </SaveButton>
        </div>
        {needsApproval ? (
          <p className="field-hint">We&apos;ll ask you to confirm by email first</p>
        ) : null}
      </form>
    </Panel>
  );
}

/* ----------------------------------------------------------- password */

function SetPasswordByEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function send() {
    setState("sending");
    setError("");
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password?next=%2Faccount%2Fsettings",
    });
    if (error) {
      setState("idle");
      setError(authErrorMessage(error));
      return;
    }
    setState("sent");
  }

  return (
    <Panel
      title="Password"
      description="Add one to sign in with email too"
    >
      <AuthError message={error} />
      {state === "sent" ? (
        <AuthNotice
          message={`We sent a link to ${email}. Open it to choose your password.`}
        />
      ) : (
        <button
          type="button"
          onClick={send}
          disabled={state === "sending"}
          className="btn btn-outline"
        >
          {state === "sending" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {state === "sending" ? "Sending…" : "Email me a set-password link"}
        </button>
      )}
    </Panel>
  );
}

export function PasswordPanel({ hasPassword, email }: { hasPassword: boolean; email: string }) {
  if (!hasPassword) return <SetPasswordByEmail email={email} />;
  return <ChangePasswordPanel />;
}

function ChangePasswordPanel() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();

  const confirmError = submitted && confirm !== password ? "Those new passwords do not match." : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setNotice("");
    if (!current) {
      setError("Enter your current password to make a change.");
      return;
    }
    const problem = passwordProblem(password);
    if (problem) {
      setError(problem);
      return;
    }
    if (confirm !== password) return;

    setPending(true);
    setError("");
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: password,
      revokeOtherSessions: signOutOthers,
    });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error, "We could not update your password. Please try again."));
      return;
    }
    setCurrent("");
    setPassword("");
    setConfirm("");
    setSubmitted(false);
    setNotice(
      signOutOthers
        ? "Password updated. Every other device has been signed out."
        : "Your password has been updated.",
    );
    router.refresh();
  }

  return (
    <Panel
      title="Password"
      aside={
        <a
          href="/forgot-password"
          className="inline-flex min-h-8 shrink-0 items-center text-xs font-semibold text-blue-700 underline-offset-4 transition hover:text-blue-800 hover:underline"
        >
          Forgot it?
        </a>
      }
    >
      <AuthNotice message={notice} />
      <AuthError message={error} />
      <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
        <div>
          <label htmlFor="current-password" className="field-label">
            Current password
          </label>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            placeholder="Your current password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="new-password" className="field-label">
            New password
          </label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="new-password-strength"
          />
          <PasswordStrength id="new-password-strength" password={password} />
        </div>
        <div>
          <label htmlFor="confirm-password" className="field-label">
            Confirm new password
          </label>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            placeholder="Type it once more"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={confirmError ? true : undefined}
          />
          <FieldError id="confirm-password-error" message={confirmError} />
        </div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm font-medium text-navy-700">
          <input
            type="checkbox"
            checked={signOutOthers}
            onChange={(event) => setSignOutOthers(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-ink"
          />
          Sign out of every other device. You&apos;ll stay signed in here.
        </label>
        <div>
          <SaveButton pending={pending} variant="btn-outline">
            Update password
          </SaveButton>
        </div>
      </form>
    </Panel>
  );
}

/* ----------------------------------------------------------- sessions */

export type DeviceSession = {
  token: string;
  current: boolean;
  device: string;
  mobile: boolean;
  ipAddress: string;
  lastActive: string;
};

export function SessionsPanel({ sessions }: { sessions: DeviceSession[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");
  const others = sessions.filter((session) => !session.current);

  async function revoke(token: string) {
    setBusy(token);
    setError("");
    const { error } = await authClient.revokeSession({ token });
    setBusy("");
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    router.refresh();
  }

  async function revokeOthers() {
    setBusy("others");
    setError("");
    const { error } = await authClient.revokeOtherSessions();
    setBusy("");
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    router.refresh();
  }

  return (
    <Panel
      title="Devices"
      description="Sign out any you don't recognise"
    >
      <AuthError message={error} />
      <ul className="divide-y divide-sand-300">
        {sessions.map((session) => {
          const Icon = session.mobile ? Smartphone : Monitor;
          return (
            <li key={session.token} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Icon className="h-5 w-5 shrink-0 text-navy-500" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                  {session.device}
                  {session.current ? (
                    <span className="badge badge-success">This device</span>
                  ) : null}
                </p>
                <p className="text-[13px] font-medium text-navy-600">
                  {[session.ipAddress, session.lastActive].filter(Boolean).join(" · ")}
                </p>
              </div>
              {session.current ? null : (
                <button
                  type="button"
                  onClick={() => revoke(session.token)}
                  disabled={Boolean(busy)}
                  className="btn btn-light"
                >
                  {busy === session.token ? "Removing…" : "Sign out"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {others.length > 0 ? (
        <button
          type="button"
          onClick={revokeOthers}
          disabled={Boolean(busy)}
          className="btn btn-outline mt-5"
        >
          {busy === "others"
            ? "Signing out…"
            : `Sign out of ${others.length === 1 ? "the other device" : `all ${others.length} other devices`}`}
        </button>
      ) : null}
    </Panel>
  );
}

/* ------------------------------------------------------------- delete */

export function DeleteAccountPanel({
  hasUpcomingTrips,
  hasPassword,
}: {
  hasUpcomingTrips: boolean;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasPassword && !password) {
      setError("Enter your password to delete your account.");
      return;
    }
    setPending(true);
    setError("");
    // Without a password, Better Auth accepts a recent sign-in instead.
    const { error } = await authClient.deleteUser(hasPassword ? { password } : {});
    if (error) {
      setPending(false);
      setError(authErrorMessage(error, "We could not delete your account. Please try again."));
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <Panel
      tone="danger"
      title="Delete account"
      description="Permanent. This can't be undone"
    >
      {hasUpcomingTrips ? (
        <p className="mb-4 rounded-[14px] border border-gold-300 bg-gold-50 px-4 py-3 text-sm font-medium text-navy-700">
          You have upcoming trips. Your bookings stay with our team, but you
          won&apos;t be able to see them online. Call us to change or cancel a
          booking.
        </p>
      ) : null}

      {open ? (
        <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
          <AuthError message={error} />
          {hasPassword ? (
            <div>
              <label htmlFor="delete-password" className="field-label">
                Confirm with your password
              </label>
              <PasswordInput
                id="delete-password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          ) : (
            <p className="type-small text-navy-700">
              Are you sure? Your account and saved details will be removed
              straight away.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="btn bg-danger text-paper hover:bg-danger/90"
            >
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {pending ? "Deleting…" : "Delete my account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword("");
                setError("");
              }}
              className="btn btn-light"
            >
              Keep my account
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-light text-danger"
        >
          Delete my account
        </button>
      )}
    </Panel>
  );
}
