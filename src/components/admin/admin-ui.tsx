import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Plus,
  Settings2,
} from "lucide-react";

export function AdminNotice({
  notice,
  error,
}: {
  notice?: string;
  error?: string;
}) {
  if (!notice && !error) return null;

  return (
    <div
      className={
        error
          ? "mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          : "mb-5 flex items-start gap-3 rounded-2xl border border-navy-200 bg-navy-50 px-4 py-3 text-sm font-semibold text-navy-800"
      }
    >
      {error ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{error || notice}</span>
    </div>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy-950 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function DatabaseSetupNotice({
  configured,
  error,
}: {
  configured: boolean;
  error?: string;
}) {
  if (configured && !error) return null;

  return (
    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-blue-700">
        <Database className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-display text-2xl font-semibold text-navy-950">
        Connect your MySQL database
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
        The admin panel is ready, but it needs MySQL before content can be
        saved. Start MySQL with Docker Compose, then run the migrations.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-2xl bg-navy-950 p-4 text-xs leading-6 text-sand-100">
{`docker compose up -d
pnpm db:migrate

# then open
http://localhost:3000/admin`}
      </pre>
      <p className="mt-4 text-xs leading-5 text-stone-500">
        <Settings2 className="mr-1 inline h-3.5 w-3.5" />
        Running without Docker? Set <code className="font-bold">DB_HOST</code>,{" "}
        <code className="font-bold">DB_NAME</code>,{" "}
        <code className="font-bold">DB_USER</code> and{" "}
        <code className="font-bold">DB_PASSWORD</code> in your environment.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sand-200 text-blue-700">
        <Plus className="h-5 w-5" />
      </span>
      <h2 className="mt-4 font-display text-2xl font-semibold text-navy-950">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary mt-6">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
