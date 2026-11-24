import Link from "next/link";
import { Pause, Pencil, Play } from "lucide-react";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteDiscountAction, toggleDiscountAction } from "@/app/admin/actions";
import { loadAdminDiscounts, loadAdminTours } from "@/lib/content";
import type { AdminDiscount } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const formatDate = (value: string) => dateFormat.format(new Date(`${value}T00:00:00Z`));

function discountState(discount: AdminDiscount, today: string) {
  if (!discount.active) return { label: "Paused", tone: "bg-sand-200 text-(--studio-secondary)" };
  if (discount.endsOn && discount.endsOn < today) return { label: "Expired", tone: "bg-red-50 text-red-700" };
  if (discount.usageLimit && discount.used >= discount.usageLimit) return { label: "Used up", tone: "bg-red-50 text-red-700" };
  if (discount.startsOn && discount.startsOn > today) return { label: "Scheduled", tone: "bg-gold-100 text-gold-700" };
  return { label: "Live", tone: "bg-(--studio-pine-wash) text-(--studio-pine)" };
}

function valueLabel(discount: AdminDiscount) {
  if (discount.kind === "fixed") return `${formatINR(discount.value)} off`;
  return `${discount.value}% off${discount.maxAmount ? ` · up to ${formatINR(discount.maxAmount)}` : ""}`;
}

export default async function AdminDiscountsPage() {
  const [result, tours] = await Promise.all([loadAdminDiscounts(), loadAdminTours()]);

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader title="Discounts" />
        <DatabaseSetupNotice configured={result.status.configured} error={result.status.error} />
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const tourTitle = new Map(tours.data.map((tour) => [tour._id, tour.title]));

  return (
    <div>
      <AdminPageHeader title="Discounts" actionHref="/admin/discounts/new" actionLabel="New discount" />

      {result.status.error ? <AdminNotice error={result.status.error} /> : null}

      {result.data.length ? (
        <div className="space-y-3">
          {result.data.map((discount) => {
            const state = discountState(discount, today);
            const titles = discount.tourIds.map((id) => tourTitle.get(id)).filter(Boolean);
            const packages = discount.scope === "all" ? "All packages"
              : titles.length <= 2 ? titles.join(", ") || "No packages"
                : `${titles.slice(0, 2).join(", ")} +${titles.length - 2} more`;
            const window = discount.startsOn || discount.endsOn
              ? `${discount.startsOn ? formatDate(discount.startsOn) : "Now"} – ${discount.endsOn ? formatDate(discount.endsOn) : "no end"}`
              : "No end date";

            return (
              <article key={discount._id} className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-sm font-medium ${state.tone}`}>{state.label}</span>
                    <span className="rounded-full bg-sand-200 px-2.5 py-1 font-mono text-sm font-medium text-(--studio-secondary)">
                      {discount.code ?? "Automatic"}
                    </span>
                    <span className="text-sm font-medium text-stone-500">{valueLabel(discount)}</span>
                  </div>
                  <h2 className="mt-1 text-base font-medium text-(--studio-text)">{discount.name}</h2>
                  <p className="mt-1 text-sm font-medium text-stone-500">
                    {packages} · {window}
                    {discount.minTravellers > 1 ? ` · ${discount.minTravellers}+ travellers` : ""}
                    {" · "}Used {discount.used}{discount.usageLimit ? ` of ${discount.usageLimit}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <form action={toggleDiscountAction}>
                    <input type="hidden" name="id" value={discount._id} />
                    <input type="hidden" name="active" value={String(!discount.active)} />
                    <button type="submit" className="btn-outline">
                      {discount.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {discount.active ? "Pause" : "Resume"}
                    </button>
                  </form>
                  <Link href={`/admin/discounts/${discount._id}`} className="btn-outline">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <AdminDeleteButton action={deleteDiscountAction} id={discount._id} compact label={`Delete ${discount.name}`}
                    confirmText={`Delete "${discount.name}"? Past bookings keep the saving they got.`} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <AdminEmptyState
          title="No discounts yet"
          description="Create a promo code or an automatic offer for one, some or all packages."
          actionHref="/admin/discounts/new"
          actionLabel="Create discount"
        />
      )}
    </div>
  );
}
