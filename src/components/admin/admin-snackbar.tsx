"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const autoDismissMs = 5000;

/**
 * Floating confirmation snackbar for admin actions.
 *
 * Server actions redirect back with `?notice=` / `?error=` (plus a `flash`
 * id), so this reads those params, shows a toast, then strips them from the
 * URL so a refresh does not replay the message.
 */
export function AdminSnackbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [closingKey, setClosingKey] = useState<string | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const notice = searchParams.get("notice") ?? "";
  const error = searchParams.get("error") ?? "";
  const flash = searchParams.get("flash") ?? "";
  const message = error || notice;
  const activeKey = message
    ? `${pathname}|${flash || message}|${error ? "error" : "notice"}`
    : null;

  const active =
    activeKey && activeKey !== dismissedKey
      ? {
          key: activeKey,
          message,
          tone: (error ? "error" : "success") as "error" | "success",
        }
      : null;

  const dismiss = useCallback((key: string) => {
    setDismissedKey(key);
    setClosingKey(null);

    const url = new URL(window.location.href);
    const removed = ["notice", "error", "flash"].filter((param) =>
      url.searchParams.has(param),
    );
    if (!removed.length) return;
    removed.forEach((param) => url.searchParams.delete(param));
    window.history.replaceState(window.history.state, "", url);
  }, []);

  useEffect(() => {
    if (!activeKey) return;

    const hideTimer = window.setTimeout(
      () => setClosingKey(activeKey),
      autoDismissMs,
    );
    const removeTimer = window.setTimeout(
      () => dismiss(activeKey),
      autoDismissMs + 250,
    );

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [activeKey, dismiss]);

  if (!active) return null;

  const closing = closingKey === active.key;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6 sm:justify-end"
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl shadow-navy-950/20 transition-all duration-300",
          closing ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
          active.tone === "error"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-navy-900/10 bg-navy-950 text-sand-50",
        )}
      >
        {active.tone === "error" ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
        )}
        <p className="flex-1 leading-5">{active.message}</p>
        <button
          type="button"
          onClick={() => dismiss(active.key)}
          className={cn(
            "-mr-1 grid h-6 w-6 shrink-0 place-items-center rounded-full transition",
            active.tone === "error"
              ? "text-red-500 hover:bg-red-100 hover:text-red-700"
              : "text-sand-200/60 hover:bg-white/10 hover:text-sand-50",
          )}
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
