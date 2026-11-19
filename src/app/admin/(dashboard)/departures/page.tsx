import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { deleteDepartureAction } from "@/app/admin/actions";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminDepartureEditor } from "@/components/admin/admin-departure-editor";
import { AdminListPagination, adminPageNumber } from "@/components/admin/admin-list-pagination";
import { AdminPackagePicker } from "@/components/admin/admin-package-picker";
import { AdminEmptyState, AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { loadAdminDepartures, loadAdminTours } from "@/lib/content";
import { formatINR } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const pageSize = 15;

export default async function AdminDeparturesPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, toursResult, departuresResult] = await Promise.all([
    searchParams, loadAdminTours(), loadAdminDepartures(),
  ]);
  const packages = toursResult.data.map(({ slug, title, image, price, destinationName }) => ({ slug, title, image, price, destinationName }));
  const selected = packages.find((tour) => tour.slug === params.tour);
  const today = new Date().toISOString().slice(0, 10);
  const editing = typeof params.edit === "string" ? departuresResult.data.find((item) => item._id === params.edit) : undefined;
  const past = params.when === "past" || Boolean(editing && editing.startDate < today);
  const related = departuresResult.data.filter((item) => !selected || item.tourSlug === selected.slug);
  const upcoming = related.filter((item) => item.startDate >= today);
  const history = related.filter((item) => item.startDate < today).reverse();
  const visible = past ? history : upcoming;
  const editIndex = editing ? visible.findIndex((item) => item._id === editing._id) : -1;
  const page = editIndex >= 0 ? Math.floor(editIndex / pageSize) + 1
    : adminPageNumber(params.page, Math.max(1, Math.ceil(visible.length / pageSize)));
  const filters = new URLSearchParams();
  if (selected) filters.set("tour", selected.slug);
  if (past) filters.set("when", "past");
  const returnTo = filters.size ? `/admin/departures?${filters}` : "/admin/departures";
  const packageBySlug = new Map(packages.map((tour) => [tour.slug, tour]));
  const unavailable = departuresResult.data.map(({ tourSlug, startDate }) => ({ tourSlug, startDate }));

  function listHref(showPast: boolean) {
    const query = new URLSearchParams(filters);
    if (showPast) query.set("when", "past");
    else query.delete("when");
    return query.size ? `/admin/departures?${query}` : "/admin/departures";
  }

  return (
    <div className="space-y-4">
      <div className="admin-workspace-header">
        <div>
          <h1 className="admin-page-title">Departures</h1>
          <p className="admin-editor-help mt-1">Set travel dates, prices, and seats for each package.</p>
        </div>
        {!!packages.length && <AdminDepartureEditor key={`${selected?.slug ?? "all"}-${params.flash ?? ""}`} packages={packages}
          selected={selected} unavailable={unavailable} minDate={today}
          returnTo={selected ? `/admin/departures?tour=${encodeURIComponent(selected.slug)}` : "/admin/departures"} />}
      </div>
      {!toursResult.status.configured ? (
        <DatabaseSetupNotice configured={false} error={toursResult.status.error} />
      ) : (
        <>
          {(toursResult.status.error || departuresResult.status.error) && <AdminNotice error={toursResult.status.error ?? departuresResult.status.error} />}
          {!packages.length ? (
            <AdminEmptyState title="No packages yet" description="Create a package before adding departure dates."
              actionHref="/admin/tours/new" actionLabel="New package" />
          ) : (
            <>
              <search className="admin-filter-panel">
                <form method="get" action="/admin/departures" className="admin-departure-filter" key={returnTo}>
                  {past && <input type="hidden" name="when" value="past" />}
                  <AdminPackagePicker packages={packages} name="tour" selected={selected?.slug} placeholder="Search packages by name or destination" />
                  <button type="submit" className="btn-outline">View dates</button>
                  {selected && <Link href={past ? "/admin/departures?when=past" : "/admin/departures"} className="admin-text-action">All packages</Link>}
                </form>
              </search>

              <section className="admin-data-panel" aria-labelledby="departure-list-title">
                <header className="admin-data-header">
                  <h2 id="departure-list-title">{selected?.title ?? "All packages"}</h2>
                  <nav aria-label="Departure dates" className="admin-view-options">
                    <Link href={listHref(false)} aria-current={!past ? "page" : undefined}>Upcoming <span>{upcoming.length}</span></Link>
                    <Link href={listHref(true)} aria-current={past ? "page" : undefined}>Past <span>{history.length}</span></Link>
                  </nav>
                </header>
                {visible.length ? (
                  <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Departure dates table">
                    <table role="table" className="admin-data-table admin-departures-table">
                      <thead role="rowgroup"><tr role="row">
                        <th role="columnheader" scope="col">Date</th>
                        {!selected && <th role="columnheader" scope="col">Package</th>}
                        <th role="columnheader" scope="col">Price per person</th>
                        <th role="columnheader" scope="col">Seats booked</th>
                        <th role="columnheader" scope="col" className="admin-table-actions">Actions</th>
                      </tr></thead>
                      <tbody role="rowgroup">
                        {visible.slice((page - 1) * pageSize, page * pageSize).map((departure) => {
                          const tour = packageBySlug.get(departure.tourSlug);
                          const date = dateFormatter.format(new Date(`${departure.startDate}T00:00:00Z`));
                          return (
                            <tr role="row" key={departure._id}>
                              <td role="cell" className="admin-departure-date"><strong>{date}</strong>{departure.note && <p>{departure.note}</p>}</td>
                              {!selected && <td role="cell" className="admin-departure-package">{tour?.title ?? departure.tourSlug}</td>}
                              <td role="cell" data-mobile-label="Price per person" className="whitespace-nowrap">{formatINR(departure.price)}</td>
                              <td role="cell" data-mobile-label="Seats booked" className="whitespace-nowrap"><strong>{departure.booked} / {departure.capacity}</strong>
                                <p>{past ? "Past departure" : departure.seatsLeft ? `${departure.seatsLeft} available` : "Sold out"}</p>
                              </td>
                              <td role="cell" className="admin-departure-actions"><div className="admin-table-actions">
                                <Link href={`/admin/departures/${departure._id}`} className="btn-outline">Details <ArrowRight size={14} /></Link>
                                <AdminDepartureEditor key={`${params.edit === departure._id ? "edit" : "closed"}-${params.flash ?? ""}`}
                                  packages={packages} selected={tour} departure={departure} unavailable={[]}
                                  minDate={today} returnTo={returnTo} defaultOpen={params.edit === departure._id} />
                                <AdminDeleteButton action={deleteDepartureAction} id={departure._id}
                                  fields={{ tourSlug: departure.tourSlug, returnTo }} confirmText={`Delete the departure on ${date}?`} compact />
                              </div></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="admin-list-empty"><CalendarDays size={24} aria-hidden />
                    <strong>No {past ? "past" : "upcoming"} departures</strong>
                    {!past && <p>Use Add dates to schedule {selected ? "this package" : "a package"}.</p>}
                  </div>
                )}
                <AdminListPagination path="/admin/departures" filters={filters} page={page} pageSize={pageSize} total={visible.length} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
