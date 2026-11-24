import { Check, CircleAlert, CircleCheck, Phone, ShieldCheck } from "lucide-react";
import { site } from "@/data/site";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-sand-100">
      <div className="container-page py-10 md:py-16">
        <div className="mx-auto grid max-w-[980px] overflow-hidden rounded-[28px] border border-sand-300 bg-paper shadow-[0_32px_80px_-52px_rgba(11,39,53,0.45)] lg:grid-cols-[0.85fr_1fr]">
          <aside className="on-ink relative hidden flex-col justify-between overflow-hidden bg-ink p-9 text-paper lg:flex">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full border border-white/10"
            />
            <div className="relative">
              <h2 className="type-h2 text-paper">
                One account.
                <br />
                Every journey.
              </h2>
              <p className="type-small mt-4 max-w-[280px] text-navy-200">
                Save your traveller details once, then book any Hidden Miles
                departure in a couple of taps.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  ["Book faster", "Your name, email and phone are filled in for you."],
                  ["All trips in one place", "See upcoming departures, payments and status."],
                  ["Trip updates first", "Meet your tour leader and get your final pack by email."],
                ].map(([heading, copy]) => (
                  <li key={heading} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-400 text-ink">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-paper">
                        {heading}
                      </span>
                      <span className="mt-0.5 block text-[13px] font-medium leading-5 text-navy-200">
                        {copy}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-10 space-y-3 border-t border-white/10 pt-6">
              <p className="flex items-center gap-2 text-[13px] font-medium text-navy-200">
                <ShieldCheck className="h-4 w-4 text-gold-400" />
                Your details stay private. Never sold, never shared.
              </p>
              <a
                href={site.phoneHref}
                className="flex items-center gap-2 text-[13px] font-semibold text-gold-400 transition hover:text-gold-300"
              >
                <Phone className="h-4 w-4" />
                Need help? {site.phone}
              </a>
            </div>
          </aside>

          <div className="p-6 sm:p-9 md:p-10">
            <h1 className="type-h2 text-ink">{title}</h1>
            <p className="type-small mt-2 max-w-md text-navy-600">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2 rounded-[14px] border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
    >
      <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export function AuthNotice({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-2 rounded-[14px] border border-success/30 bg-success-soft px-4 py-3 text-sm font-semibold text-success"
    >
      <CircleCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export function AccountsUnavailable() {
  return (
    <div className="mb-5 rounded-[14px] border border-sand-300 bg-sand-100 px-4 py-3 text-sm font-medium text-navy-700">
      Accounts need the MySQL database. Start it with{" "}
      <code className="font-semibold">docker compose up -d</code>, then try again.
    </div>
  );
}

export function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

const oauthErrors: Record<string, string> = {
  access_denied: "Google sign-in was cancelled. You can try again or use your email.",
  account_not_linked:
    "This email already has an account. Sign in with your password, then connect Google in account settings.",
  unable_to_link_account:
    "We could not connect that Google account. Sign in with your password instead.",
  email_not_found: "Google did not share an email address, so we could not sign you in.",
  signup_disabled: "New accounts can't be created right now.",
};

/**
 * Better Auth sends OAuth failures back as ?error=<code>. Our own pages pass
 * plain sentences. Turn codes into something a traveller can act on.
 */
export function authPageError(value: string) {
  if (!value) return "";
  if (oauthErrors[value]) return oauthErrors[value];
  if (/^[a-z_]+$/.test(value)) return "Google sign-in didn't work. Please try again or use your email.";
  return value;
}
