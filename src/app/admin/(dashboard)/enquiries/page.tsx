import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Inbox, MessageCircle, Search } from "lucide-react";
import { AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { AdminListPagination, adminPageNumber } from "@/components/admin/admin-list-pagination";
import { AdminBookingSortButton as AdminSortButton } from "@/components/admin/admin-booking-sort-button";
import { AdminRequestStatus } from "@/components/admin/admin-request-status";
import { updateEnquiryStatusAction } from "@/app/admin/actions";
import { splitEnquiryMessage } from "@/lib/enquiry-message";
import { loadAdminEnquiries } from "@/lib/content";
import { enquiryStatusLabels as statusLabels } from "@/lib/enquiry-status";
import type { AdminEnquiry, EnquiryStatus } from "@/lib/types";

const stages = [
  { status: "new", title: "New", icon: Inbox },
  { status: "contacted", title: "Contacted", icon: MessageCircle },
  { status: "closed", title: "Closed", icon: CheckCircle2 },
] as const;
const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
const pageSize = 15;
const columns = [
  ["traveller", "Traveller"], ["topic", "Enquiry"], ["received", "Received"], ["status", "Status"],
] as const;

function enquiryTopic(item: AdminEnquiry) {
  return item.tour || item.destination || (item.type === "newsletter" ? "Newsletter signup" : "General enquiry");
}

export default async function AdminEnquiriesPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [result, params] = await Promise.all([loadAdminEnquiries(), searchParams]);
  const active = stages.find(({ status }) => status === params.status)?.status;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const term = query.toLowerCase();
  const matched = result.data.filter((item) =>
    !term || [item.name, item.email, item.phone, item.destination, item.tour, item.message]
      .some((value) => value?.toLowerCase().includes(term)));
  const counts = { new: 0, contacted: 0, closed: 0 };
  for (const item of matched) counts[item.status ?? "new"]++;
  const [key, requestedOrder] = typeof params.sort === "string" ? params.sort.split("-") : [];
  const sortColumn = columns.find(([column]) => column === key)?.[0] ?? "received";
  const order = requestedOrder === "asc" || requestedOrder === "desc" ? requestedOrder : "desc";
  const sort = `${sortColumn}-${order}`;
  const direction = order === "asc" ? 1 : -1;
  const visible = matched.filter((item) => !active || (item.status ?? "new") === active).sort((a, b) => {
    const difference = sortColumn === "traveller" ? (a.name || a.email).localeCompare(b.name || b.email)
      : sortColumn === "topic" ? enquiryTopic(a).localeCompare(enquiryTopic(b))
      : sortColumn === "status" ? statusLabels[a.status ?? "new"].localeCompare(statusLabels[b.status ?? "new"])
      : a.createdAt - b.createdAt;
    return difference * direction || b.createdAt - a.createdAt || Number(b._id) - Number(a._id);
  });
  const page = adminPageNumber(params.page, Math.max(1, Math.ceil(visible.length / pageSize)));
  const filters = new URLSearchParams();
  if (active) filters.set("status", active);
  if (query) filters.set("q", query);
  if (sort !== "received-desc") filters.set("sort", sort);

  function href(status?: EnquiryStatus, targetPage = 1, sorting = sort, search = query) {
    const values = new URLSearchParams();
    if (status) values.set("status", status);
    if (search) values.set("q", search);
    if (sorting !== "received-desc") values.set("sort", sorting);
    if (targetPage > 1) values.set("page", String(targetPage));
    return values.size ? `/admin/enquiries?${values}` : "/admin/enquiries";
  }

  return (
    <div className="admin-departure-workspace">
      <header><h1 className="admin-page-title">Enquiries</h1></header>
      {!result.status.configured ? <DatabaseSetupNotice configured={false} error={result.status.error} /> : (
        <>
          {result.status.error && <AdminNotice error={result.status.error} />}
          <nav className="admin-enquiry-metrics" aria-label="Filter enquiries by status">
            {stages.map(({ status, title, icon: Icon }) => (
              <Link key={status} href={href(active === status ? undefined : status)}
                aria-current={active === status ? "page" : undefined} className="admin-enquiry-metric" data-stage={status}>
                <span className="admin-enquiry-metric-label"><span className="admin-enquiry-metric-icon"><Icon size={16} aria-hidden /></span>{title}</span>
                <span className="admin-enquiry-metric-count">{counts[status]}</span>
                <span className="admin-enquiry-metric-track" aria-hidden><span style={{ width: `${matched.length ? counts[status] / matched.length * 100 : 0}%` }} /></span>
              </Link>
            ))}
          </nav>

          <section className="admin-data-panel" aria-labelledby="enquiry-inbox">
            <header className="admin-data-header admin-enquiry-header">
              <div>
                <h2 id="enquiry-inbox">{active ? `${statusLabels[active]} enquiries` : "Inbox"} <span className="admin-count">{visible.length}</span></h2>
                {active && <Link className="admin-data-link mt-1" href={href()}>All enquiries</Link>}
              </div>
              <search>
                <form method="get" action="/admin/enquiries" key={filters.toString()} className="admin-enquiry-search">
                  {active && <input type="hidden" name="status" value={active} />}
                  {filters.has("sort") && <input type="hidden" name="sort" value={sort} />}
                  <label className="admin-search-field">
                    <span className="sr-only">Search enquiries</span><Search size={16} aria-hidden />
                    <input type="search" className="field" name="q" defaultValue={query} placeholder="Search enquiries" />
                  </label>
                  <button className="btn-outline" type="submit">Search</button>
                  {query && <Link className="admin-data-link" href={href(active, 1, sort, "")}>Clear</Link>}
                </form>
              </search>
            </header>
            {visible.length > 0 && (
              <form method="get" action="/admin/enquiries" className="admin-departure-mobile-sort" key={sort}>
                {[...filters].filter(([name]) => name !== "sort").map(([name, value]) =>
                  <input type="hidden" key={name} name={name} value={value} />)}
                <label><span className="field-label">Sort by</span>
                  <select name="sort" className="field" defaultValue={sort}>
                    {columns.flatMap(([name, label]) => [
                      <option key={name + "-asc"} value={name + "-asc"}>{label} · {name === "received" ? "Oldest first" : "A to Z"}</option>,
                      <option key={name + "-desc"} value={name + "-desc"}>{label} · {name === "received" ? "Newest first" : "Z to A"}</option>,
                    ])}
                  </select>
                </label>
                <button type="submit" className="btn-outline">Sort</button>
              </form>
            )}
            {visible.length ? (
              <div className="admin-enquiry-table-wrap" tabIndex={0} role="region" aria-labelledby="enquiry-inbox">
                <table className="admin-data-table admin-enquiry-table" role="table">
                  <thead role="rowgroup"><tr role="row">
                    {columns.map(([name, label]) => (
                      <th key={name} scope="col" role="columnheader"
                        aria-sort={sortColumn === name ? order === "asc" ? "ascending" : "descending" : undefined}>
                        <AdminSortButton label={label} direction={sortColumn === name ? order : undefined}
                          href={href(active, 1, `${name}-${sortColumn === name && order === "asc" ? "desc" : "asc"}`)} />
                      </th>
                    ))}
                    <th scope="col" role="columnheader" className="admin-request-details-cell"><span className="sr-only">Details</span></th>
                  </tr></thead>
                  <tbody role="rowgroup">
                    {visible.slice((page - 1) * pageSize, page * pageSize).map((item) => {
                      const status = item.status ?? "new";
                      const topic = enquiryTopic(item);
                      const trip = [item.tour && item.destination, item.travellers, item.travelMonth].filter(Boolean).join(" · ");
                      const returnTo = href(active, page);
                      const detailHref = `/admin/enquiries/${item._id}?from=${encodeURIComponent(returnTo)}`;
                      const { interest } = splitEnquiryMessage(item.message);
                      return (
                        <tr key={item._id} role="row">
                          <th scope="row" role="rowheader" className="admin-enquiry-traveller">
                            <Link className="admin-booking-detail-link" href={detailHref}>
                              {item.name || item.email}<ArrowRight size={14} aria-hidden />
                            </Link>
                            {item.email && <a href={`mailto:${item.email}`} className="admin-enquiry-contact">{item.email}<ArrowUpRight size={12} aria-hidden /></a>}
                            {item.phone && <a href={`tel:${item.phone.replace(/\s/g, "")}`} className="admin-enquiry-contact">{item.phone}</a>}
                          </th>
                          <td role="cell" className="admin-enquiry-message">
                            <span className="admin-enquiry-topic">{topic}</span>
                            {trip && <p>{trip}</p>}
                            {interest && <p>Interested in: {interest}</p>}
                          </td>
                          <td role="cell" data-label="Received" className="admin-enquiry-received">
                            <time dateTime={new Date(item.createdAt).toISOString()}>{dateFormatter.format(new Date(item.createdAt))}</time>
                            {item.source && <p>{item.source}</p>}
                          </td>
                          <td role="cell" className="admin-enquiry-status">
                            <AdminRequestStatus key={status} id={item._id} status={status} name={item.name || item.email}
                              action={updateEnquiryStatusAction} labels={statusLabels} fieldLabel="Enquiry status" returnTo={returnTo} />
                          </td>
                          <td role="cell" className="admin-request-details-cell">
                            <Link className="btn-outline" href={detailHref} aria-label={`Details for ${item.name || item.email}`}>Details</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-list-empty">
                <Inbox size={24} aria-hidden />
                <strong>{query ? "No enquiries match your search" : active ? `No ${statusLabels[active].toLowerCase()} enquiries` : "No enquiries yet"}</strong>
              </div>
            )}
            <AdminListPagination path="/admin/enquiries" filters={filters} page={page} total={visible.length} pageSize={pageSize} />
          </section>
        </>
      )}
    </div>
  );
}
