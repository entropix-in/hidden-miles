import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Plus,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statTones = {
  blue: "bg-(--studio-pine-wash) text-(--studio-pine)",
  gold: "bg-gold-100 text-gold-700",
  navy: "bg-(--studio-pine-wash) text-(--studio-secondary)",
  emerald: "bg-emerald-50 text-emerald-700",
} as const;

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  icon: LucideIcon;
  tone: keyof typeof statTones;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-navy-950/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-stone-500">
          {label}
        </p>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            statTones[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold leading-none tracking-tight text-(--studio-text)">
        {value}
      </p>
      <p className="mt-2 text-xs font-medium leading-4 text-stone-500">
        {detail}
      </p>
    </div>
  );
}


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
          ? "mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          : "mb-4 flex items-start gap-3 rounded-2xl border border-navy-200 bg-(--studio-pine-wash) px-4 py-3 text-sm font-medium text-(--studio-secondary)"
      }
    >
      {error ? (
        <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />
      )}
      <span>{error || notice}</span>
    </div>
  );
}

export function AdminPageHeader({
  title,
  actionHref,
  actionLabel,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="admin-page-title">
          {title}
        </h1>
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
    <div className="rounded-3xl border border-(--studio-rule) bg-(--studio-pine-wash) p-5 sm:p-6">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-(--studio-pine-wash) text-(--studio-pine)">
        <Database className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-(--studio-text)">
        Connect your MySQL database
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-5 text-stone-600">
        The admin panel is ready, but it needs MySQL before content can be
        saved. Start MySQL with Docker Compose, then run the migrations.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-2xl bg-(--studio-text) p-4 text-sm leading-6 text-sand-100">
{`docker compose up -d
pnpm db:migrate

# then open
http://localhost:3000/admin`}
      </pre>
      <p className="mt-4 text-sm leading-5 text-stone-500">
        <Settings2 className="mr-1 inline h-3.5 w-3.5" />
        Running without Docker? Set <code className="font-medium">DB_HOST</code>,{" "}
        <code className="font-medium">DB_NAME</code>,{" "}
        <code className="font-medium">DB_USER</code> and{" "}
        <code className="font-medium">DB_PASSWORD</code> in your environment.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
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
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-5 py-14 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sand-200 text-(--studio-pine)">
        <Plus className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-(--studio-text)">
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
