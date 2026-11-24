"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { authClient, authErrorMessage } from "@/lib/auth-client";
import { withNext } from "@/lib/auth-rules";
import { AuthError } from "@/components/site/auth-card";
import { Divider } from "./form-parts";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.8Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4.01-3.11Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.27 6.6l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

/** "Continue with Google" plus an "or" divider, shown above the email form. */
export function GoogleSignIn({
  next,
  errorPath,
  dividerLabel = "or use your email",
}: {
  next: string;
  errorPath: "/login" | "/signup";
  dividerLabel?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setPending(true);
    setError("");
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      newUserCallbackURL: next,
      errorCallbackURL: withNext(errorPath, next),
    });
    // On success the browser is already on its way to Google.
    if (error) {
      setPending(false);
      setError(authErrorMessage(error, "We could not reach Google. Please try again."));
    }
  }

  return (
    <>
      <AuthError message={error} />
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        aria-busy={pending}
        className="btn btn-light btn-lg w-full"
      >
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <GoogleMark />
        )}
        {pending ? "Opening Google…" : "Continue with Google"}
      </button>
      <Divider label={dividerLabel} />
    </>
  );
}
