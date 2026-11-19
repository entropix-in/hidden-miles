import { redirect } from "next/navigation";

export default function LegacyDeparturesIndexPage() {
  redirect("/admin/departures");
}
