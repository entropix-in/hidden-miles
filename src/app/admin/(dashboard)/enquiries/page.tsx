import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  DatabaseSetupNotice,
} from "@/components/admin/admin-ui";
import { updateEnquiryStatusAction } from "@/app/admin/actions";
import { loadAdminEnquiries } from "@/lib/content";
import type { EnquiryStatus } from "@/lib/types";

const statusStyles: Record<EnquiryStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-sky-100 text-sky-800",
  closed: "bg-stone-200 text-stone-600",
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const notice = typeof params.notice === "string" ? params.notice : "";
  const error = typeof params.error === "string" ? params.error : "";
  const result = await loadAdminEnquiries();

  if (!result.status.configured) {
    return (
      <div>
        <AdminPageHeader
          eyebrow="Enquiries"
          title="Enquiries"
          description="Messages sent by travellers from the website."
        />
        <DatabaseSetupNotice
          configured={result.status.configured}
          error={result.status.error}
        />
      </div>
    );
  }

  const counts = {
    new: result.data.filter((item) => (item.status ?? "new") === "new").length,
    contacted: result.data.filter((item) => item.status === "contacted").length,
    closed: result.data.filter((item) => item.status === "closed").length,
  };

  return (
    <div>
      <AdminNotice notice={notice} error={error} />
      <AdminPageHeader
        eyebrow="Enquiries"
        title="Enquiries"
        description="Every enquiry submitted on the website lands here in real time."
      />

      {result.status.error ? (
        <AdminNotice error={result.status.error} />
      ) : null}

      <div className="mb-5 grid grid-cols-3 gap-3">
        {(
          [
            ["New", counts.new, "new"],
            ["Contacted", counts.contacted, "contacted"],
            ["Closed", counts.closed, "closed"],
          ] as const
        ).map(([label, value, status]) => (
          <div
            key={label}
            className={`rounded-2xl border border-stone-200 bg-white px-4 py-3 ${statusStyles[status]}`}
          >
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-sm font-extrabold uppercase tracking-wider opacity-70">
              {label}
            </p>
          </div>
        ))}
      </div>

      {result.data.length ? (
        <div className="space-y-3">
          {result.data.map((enquiry) => {
            const status = (enquiry.status ?? "new") as EnquiryStatus;

            return (
              <article
                key={enquiry._id}
                className="rounded-[26px] border border-stone-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-semibold text-navy-950">
                        {enquiry.name}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-sm font-extrabold uppercase tracking-wider ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                      <span className="rounded-full bg-sand-200 px-2.5 py-1 text-sm font-extrabold uppercase tracking-wider text-navy-800">
                        {enquiry.type === "newsletter"
                          ? "Newsletter"
                          : "Enquiry"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-stone-400">
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(enquiry.createdAt))}
                      {enquiry.source ? ` · ${enquiry.source}` : ""}
                    </p>
                  </div>

                  <form
                    action={updateEnquiryStatusAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={enquiry._id} />
                    <select
                      name="status"
                      defaultValue={status}
                      className="rounded-full border border-stone-200 bg-sand-50 px-3 py-2 text-sm font-bold text-navy-950 outline-none focus:border-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-full bg-navy-950 px-3.5 py-2 text-sm font-extrabold uppercase tracking-wider text-sand-50 transition hover:bg-navy-900"
                    >
                      Save
                    </button>
                  </form>
                </div>

                <div className="mt-4 grid gap-2 text-sm leading-5 text-stone-600 sm:grid-cols-2 lg:grid-cols-4">
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="flex items-center gap-2 font-semibold hover:text-blue-700"
                  >
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    {enquiry.email}
                  </a>
                  {enquiry.phone ? (
                    <a
                      href={`tel:${enquiry.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 font-semibold hover:text-blue-700"
                    >
                      <Phone className="h-3.5 w-3.5 text-blue-600" />
                      {enquiry.phone}
                    </a>
                  ) : null}
                  {enquiry.destination ? (
                    <p className="flex items-center gap-2 font-semibold">
                      <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
                      {enquiry.destination}
                    </p>
                  ) : null}
                  <p className="font-semibold">
                    {enquiry.travellers
                      ? `${enquiry.travellers} travellers`
                      : ""}
                    {enquiry.travelMonth ? ` · ${enquiry.travelMonth}` : ""}
                  </p>
                </div>

                {enquiry.tour ? (
                  <p className="mt-3 inline-flex rounded-full bg-sand-100 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-navy-800">
                    {enquiry.tour}
                  </p>
                ) : null}

                {enquiry.message ? (
                  <p className="mt-3 rounded-2xl bg-sand-50 px-4 py-3 text-sm leading-6 text-stone-600">
                    {enquiry.message}
                  </p>
                ) : null}

                <Link
                  href={enquiry.email ? `mailto:${enquiry.email}` : "/admin"}
                  className="mt-3 inline-block text-sm font-extrabold uppercase tracking-wider text-blue-700 hover:text-blue-800"
                >
                  Reply by email
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <AdminEmptyState
          title="No enquiries yet"
          description="When a traveller submits the enquiry form, it will appear here instantly."
        />
      )}
    </div>
  );
}
