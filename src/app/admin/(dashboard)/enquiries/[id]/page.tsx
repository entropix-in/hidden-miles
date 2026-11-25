import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { deleteEnquiryAction, updateEnquiryStatusAction } from "@/app/admin/actions";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminRequestStatus } from "@/components/admin/admin-request-status";
import { AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { splitEnquiryMessage } from "@/lib/enquiry-message";
import { loadAdminEnquiry } from "@/lib/content";
import { enquiryStatusLabels } from "@/lib/enquiry-status";

const received = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export default async function AdminEnquiryDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await loadAdminEnquiry(id);
  const enquiry = result.data[0];
  const back = typeof query.from === "string" && query.from.startsWith("/admin/enquiries?") ? query.from : "/admin/enquiries";

  if (!result.status.configured) return <DatabaseSetupNotice configured={false} error={result.status.error} />;

  const { interest, message } = splitEnquiryMessage(enquiry?.message);
  const status = enquiry?.status ?? "new";
  const name = enquiry?.name || enquiry?.email || "Enquiry";
  const facts = [
    ["Interested in", interest],
    ["Package", enquiry?.tour],
    ["Destination", enquiry?.destination],
    ["Travellers", enquiry?.travellers],
    ["Travel month", enquiry?.travelMonth],
    ["Source", enquiry?.source],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="admin-departure-workspace admin-departure-detail">
      <nav aria-label="Breadcrumb"><Link href={back} className="admin-data-link"><ArrowLeft size={16} aria-hidden /> Back to enquiries</Link></nav>
      {result.status.error && <AdminNotice error={result.status.error} />}
      {enquiry ? (
        <>
          <header className="admin-workspace-header">
            <div>
              <h1 className="admin-page-title">{name}</h1>
              <p className="admin-departure-meta mt-1">{enquiry.type === "newsletter" ? "Newsletter signup" : `Enquiry #${enquiry._id}`} · {received.format(new Date(enquiry.createdAt))}</p>
            </div>
            <AdminRequestStatus key={status} id={enquiry._id} name={name} status={status} labels={enquiryStatusLabels}
              action={updateEnquiryStatusAction} fieldLabel="Enquiry status"
              returnTo={`/admin/enquiries/${enquiry._id}?from=${encodeURIComponent(back)}`} />
          </header>
          <div className="admin-booking-detail-panels">
            <section className="admin-data-panel admin-booking-detail-panel" aria-labelledby="enquiry-message">
              <h2 id="enquiry-message">Message</h2>
              {message ? <p className="whitespace-pre-wrap wrap-anywhere">{message}</p>
                : <p className="admin-editor-help">No message included.</p>}
            </section>
            <section className="admin-data-panel admin-booking-detail-panel" aria-labelledby="enquiry-contact">
              <h2 id="enquiry-contact">Contact</h2>
              <dl className="admin-booking-contact">
                <div><dt>Email</dt><dd>{enquiry.email ? <a className="admin-data-link" href={`mailto:${enquiry.email}`}>{enquiry.email}</a> : "Not provided"}</dd></div>
                <div><dt>Phone</dt><dd>{enquiry.phone ? <a className="admin-data-link" href={`tel:${enquiry.phone.replace(/\s/g, "")}`}>{enquiry.phone}</a> : "Not provided"}</dd></div>
              </dl>
            </section>
          </div>
          {facts.length > 0 && (
            <section className="admin-data-panel admin-booking-detail-panel" aria-labelledby="enquiry-details">
              <h2 id="enquiry-details">Enquiry details</h2>
              <dl className="admin-booking-contact sm:grid-cols-2 lg:grid-cols-3">
                {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            </section>
          )}
          <footer className="flex justify-end">
            <AdminDeleteButton action={deleteEnquiryAction} id={enquiry._id} fields={{ returnTo: back }}
              label="Delete enquiry" confirmText={`Delete the enquiry from ${name}? This cannot be undone.`} />
          </footer>
        </>
      ) : <h1 className="admin-page-title">Enquiry not found</h1>}
    </div>
  );
}
