import { redirect } from "next/navigation";

export default async function LegacyDeparturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/departures/${encodeURIComponent(id)}`);
}
