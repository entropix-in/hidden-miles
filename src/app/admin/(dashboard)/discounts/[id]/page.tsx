import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminDiscountForm } from "@/components/admin/admin-discount-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteDiscountAction } from "@/app/admin/actions";
import { loadAdminDiscount, loadAdminTours } from "@/lib/content";
import { discountPackageOptions } from "../package-options";

export default async function EditDiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [discount, tours] = await Promise.all([loadAdminDiscount(id), loadAdminTours()]);
  if (!discount) notFound();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader title={discount.name} />
        <div className="mb-6 shrink-0">
          <AdminDeleteButton action={deleteDiscountAction} id={discount._id}
            confirmText={`Delete "${discount.name}"? Past bookings keep the saving they got.`} />
        </div>
      </div>
      <AdminDiscountForm discount={discount} packages={discountPackageOptions(tours.data)} />
    </div>
  );
}
