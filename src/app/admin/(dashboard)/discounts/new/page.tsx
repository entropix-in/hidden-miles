import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminDiscountForm } from "@/components/admin/admin-discount-form";
import { loadAdminTours } from "@/lib/content";
import { discountPackageOptions } from "../package-options";

export default async function NewDiscountPage() {
  const tours = await loadAdminTours();
  return (
    <div>
      <AdminPageHeader title="New discount" />
      <AdminDiscountForm packages={discountPackageOptions(tours.data)} />
    </div>
  );
}
