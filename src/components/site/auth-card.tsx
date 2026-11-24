import { Check, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { site } from "@/data/site";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
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
              <p className="type-label text-gold-400">{eyebrow}</p>
              <h2 className="type-h2 mt-3 text-paper">
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
            <p className="type-label flex items-center gap-2 text-gold-600">
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </p>
            <h1 className="type-h2 mt-2 text-ink">{title}</h1>
            <p className="type-small mt-2 max-w-md text-navy-600">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2 rounded-[14px] border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
    >
      <span aria-hidden="true" className="mt-px">
        ⚠
      </span>
      {message}
    </div>
  );
}

export function AuthNotice({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-2 rounded-[14px] border border-success/30 bg-success-soft px-4 py-3 text-sm font-semibold text-success"
    >
      <span aria-hidden="true" className="mt-px">
        ✓
      </span>
      {message}
    </div>
  );
}
