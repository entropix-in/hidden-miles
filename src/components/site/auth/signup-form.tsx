"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { AuthError } from "@/components/site/auth-card";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import {
  isValidEmail,
  nameProblem,
  passwordProblem,
  phoneProblem,
  withNext,
} from "@/lib/auth-rules";
import { CheckInbox, Divider, FieldError, PasswordStrength, SubmitButton } from "./form-parts";
import { GoogleSignIn } from "./google-button";

type Fields = "name" | "email" | "phone" | "password" | "confirmPassword";

export function SignupForm({
  next,
  disabled,
  google,
  error: initialError = "",
}: {
  next: string;
  disabled: boolean;
  google: boolean;
  error?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<Fields, string>>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError);
  const [sentTo, setSentTo] = useState("");

  const problems: Record<Fields, string> = {
    name: nameProblem(values.name),
    email: isValidEmail(values.email) ? "" : "Please enter a valid email address.",
    phone: phoneProblem(values.phone),
    password: passwordProblem(values.password),
    confirmPassword:
      values.confirmPassword && values.confirmPassword === values.password
        ? ""
        : "Those passwords do not match.",
  };
  const show = (field: Fields) => (touched[field] ? problems[field] : "");

  const bind = (field: Fields) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: (event: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [field]: event.target.value })),
    onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
    "aria-invalid": show(field) ? true : undefined,
    "aria-describedby": show(field) ? `${field}-error` : undefined,
  });

  const verifyUrl = `/verify-email?next=${encodeURIComponent(next)}`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
    const firstProblem = (Object.keys(problems) as Fields[]).find((field) => problems[field]);
    if (firstProblem) {
      document.getElementById(firstProblem)?.focus();
      return;
    }

    setPending(true);
    setError("");
    const email = values.email.trim().toLowerCase();
    const { data, error } = await authClient.signUp.email({
      name: values.name.trim(),
      email,
      password: values.password,
      phone: values.phone.trim(),
      callbackURL: verifyUrl,
    });

    if (error) {
      setPending(false);
      setError(authErrorMessage(error, "We could not create your account. Please try again."));
      return;
    }

    // No token means the server wants the email confirmed first.
    if (!data?.token) {
      setPending(false);
      setSentTo(email);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  if (sentTo) {
    return (
      <CheckInbox
        email={sentTo}
        title="Almost there. Check your inbox"
        callbackURL={verifyUrl}
        backHref={withNext("/login", next)}
      />
    );
  }

  return (
    <>
      <AuthError message={error} />

      {google && !disabled ? (
        <GoogleSignIn next={next} errorPath="/signup" dividerLabel="or sign up with email" />
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <input
            {...bind("name")}
            autoComplete="name"
            placeholder="As on government ID"
            className="field"
          />
          <FieldError id="name-error" message={show("name")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="field-label">
              Email address
            </label>
            <input
              {...bind("email")}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@email.com"
              className="field"
            />
            <FieldError id="email-error" message={show("email")} />
          </div>
          <div>
            <label htmlFor="phone" className="field-label">
              Phone <span className="font-medium text-navy-500">(optional)</span>
            </label>
            <input
              {...bind("phone")}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+91"
              className="field"
            />
            <FieldError id="phone-error" message={show("phone")} />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <PasswordInput
            {...bind("password")}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-describedby="password-strength"
          />
          {show("password") && values.password.length === 0 ? (
            <FieldError id="password-error" message={show("password")} />
          ) : (
            <PasswordStrength id="password-strength" password={values.password} />
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="field-label">
            Confirm password
          </label>
          <PasswordInput
            {...bind("confirmPassword")}
            autoComplete="new-password"
            placeholder="Type it once more"
          />
          <FieldError id="confirmPassword-error" message={show("confirmPassword")} />
        </div>

        <SubmitButton pending={pending} pendingLabel="Creating your account…" className={disabled ? "mt-2 pointer-events-none opacity-55" : "mt-2"}>
          <UserPlus className="h-4 w-4" aria-hidden />
          Create my account
        </SubmitButton>
      </form>

      <p className="mt-4 text-center text-[12px] font-medium leading-5 text-navy-600">
        By continuing you agree to our booking terms and privacy policy. We only
        use your details to plan your trip.
      </p>

      <Divider label="Already with us?" />

      <Link href={withNext("/login", next)} className="btn btn-outline btn-lg w-full">
        Sign in instead
        <span className="btn-dot">→</span>
      </Link>
    </>
  );
}
