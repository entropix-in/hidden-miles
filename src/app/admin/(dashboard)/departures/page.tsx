import Link from "next/link";
import { ArrowDown, ArrowDownUp, ArrowRight, ArrowUp, CalendarDays, List } from "lucide-react";
import { deleteDepartureAction } from "@/app/admin/actions";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminDepartureOverview } from "@/components/admin/admin-departure-overview";
import { AdminDeparturePackage, departurePackage } from "@/components/admin/admin-departure-package";
import { AdminDepartureEditor } from "@/components/admin/admin-departure-editor";
import { AdminListPagination, adminPageNumber } from "@/components/admin/admin-list-pagination";
import { AdminPackagePicker } from "@/components/admin/admin-package-picker";
import { AdminEmptyState, AdminNotice, DatabaseSetupNotice } from "@/components/admin/admin-ui";
import { loadAdminDepartures, loadAdminTours } from "@/lib/content";
import { calendarToday, dateLabel } from "@/lib/departure-dates";
import { formatINR } from "@/lib/utils";

const pageSize = 15;
const columns = [
  ["date", "Date"], ["package", "Package"], ["price", "Price per person"], ["seats", "Seats booked"],
] as const;
type SortColumn = typeof columns[number][0];

export default async function AdminDeparturesPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, toursResult, departuresResult] = await Promise.all([
    searchParams, loadAdminTours(), loadAdminDepartures(),
  ]);
  const packages = toursResult.data.map(departurePackage);
  const selected = packages.find((tour) => tour.slug === params.tour);
  const today = calendarToday();
  const editing = typeof params.edit === "string" ? departuresResult.data.find((item) => item._id === params.edit) : undefined;
  const calendar = params.view === "calendar" && !editing;
  const past = params.when === "past" || Boolean(editing && editing.startDate < today);
  const fallbackOrder = past ? "desc" : "asc";
  const sortParam = typeof params.sort === "string" ? params.sort : "";
  const [requestedColumn, requestedOrder] = sortParam.split("-");
  const column = columns.find(([name]) => name === requestedColumn)?.[0] ?? "date";
  const order = requestedOrder === "asc" || requestedOrder === "desc" ? requestedOrder : fallbackOrder;
  const sort = `${column}-${order}`;
  const direction = order === "asc" ? 1 : -1;
  const packageBySlug = new Map(packages.map((tour) => [tour.slug, tour]));
  const titleFor = (slug: string) => packageBySlug.get(slug)?.title ?? slug;
  const related = departuresResult.data.filter((item) => !selected || item.tourSlug === selected.slug);
  const upcoming = related.filter((item) => item.startDate >= today);
  const history = related.filter((item) => item.startDate < today);
  const visible = [...(past ? history : upcoming)].sort((a, b) => {
    const byDate = a.startDate.localeCompare(b.startDate);
    const difference = column === "package" ? titleFor(a.tourSlug).localeCompare(titleFor(b.tourSlug))
      : column === "price" ? a.price - b.price : column === "seats" ? a.booked - b.booked : byDate;
    return difference * direction || byDate || a._id.localeCompare(b._id);
  });
  const editIndex = editing ? visible.findIndex((item) => item._id === editing._id) : -1;
  const page = editIndex >= 0 ? Math.floor(editIndex / pageSize) + 1
    : adminPageNumber(params.page, Math.max(1, Math.ceil(visible.length / pageSize)));
  const filters = new URLSearchParams();
  if (selected) filters.set("tour", selected.slug);
  if (past) filters.set("when", "past");
  if (calendar) filters.set("view", "calendar");
  if (sortParam) filters.set("sort", sort);
  const unavailable = departuresResult.data.map(({ tourSlug, startDate }) => ({ tourSlug, startDate }));

  function href(changes: Record<string, string> = {}) {
    const query = new URLSearchParams(filters);
    for (const [key, value] of Object.entries(changes)) {
      if (value) query.set(key, value);
      else query.delete(key);
    }
    return query.size ? `/admin/departures?${query}` : "/admin/departures";
  }

  function sortHref(next: SortColumn) {
    return href({ sort: `${next}-${column === next && order === "asc" ? "desc" : "asc"}` });
  }

  return (
    <div className="admin-departure-workspace">
      <div className="admin-workspace-header">
        <div>
          <h1 className="admin-page-title">Departures</h1>
          <p className="admin-editor-help mt-1">Set travel dates, prices, and seats for each package.</p>
        </div>
        {!!packages.length && <AdminDepartureEditor key={`${selected?.slug ?? "all"}-${params.flash ?? ""}`} packages={packages}
          selected={selected} unavailable={unavailable} minDate={today}
          returnTo={href({ when: "" })} />}
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
                <form method="get" action="/admin/departures" className="admin-departure-filter" key={href()}>
                  {[...filters].filter(([key]) => key !== "tour").map(([key, value]) =>
                    <input key={key} type="hidden" name={key} value={value} />)}
                  <AdminPackagePicker packages={packages} name="tour" selected={selected?.slug} placeholder="Search packages by name or destination" />
                  <button type="submit" className="btn-outline">View dates</button>
                  {selected && <Link href={href({ tour: "" })} className="admin-text-action">All packages</Link>}
                </form>
              </search>

              <section className="admin-data-panel" aria-labelledby="departure-list-title">
                <header className="admin-data-header admin-departure-list-header">
                  <h2 id="departure-list-title">{selected?.title ?? "All packages"}</h2>
                  <div className="admin-departure-list-controls">
                    {!calendar && <nav aria-label="Departure dates" className="admin-view-options">
                      <Link href={href({ when: "" })} aria-current={!past ? "page" : undefined}>Upcoming <span>{upcoming.length}</span></Link>
                      <Link href={href({ when: "past" })} aria-current={past ? "page" : undefined}>Past <span>{history.length}</span></Link>
                    </nav>}
                    <nav aria-label="Departure view" className="admin-view-switch">
                      <Link href={href({ view: "" })} aria-current={!calendar ? "page" : undefined}><List size={16} aria-hidden /> List</Link>
                      <Link href={href({ view: "calendar" })} aria-current={calendar ? "page" : undefined}><CalendarDays size={16} aria-hidden /> Calendar</Link>
                    </nav>
                  </div>
                </header>
                {calendar ? (
                  <AdminDepartureOverview key={selected?.slug ?? "all"} today={today}
                    entries={related.map((item) => ({ id: item._id, date: item.startDate, title: titleFor(item.tourSlug),
                      price: item.price, seats: item.seatsLeft }))} />
                ) : (
                  <>
                    <form method="get" action="/admin/departures" className="admin-departure-mobile-sort" key={sort}>
                      {[...filters].filter(([key]) => key !== "sort").map(([key, value]) =>
                        <input key={key} type="hidden" name={key} value={value} />)}
                      <label><span className="field-label">Sort by</span>
                        <select className="field" name="sort" defaultValue={sort}>
                          <option value="date-asc">Date · earliest first</option>
                          <option value="date-desc">Date · latest first</option>
                          <option value="package-asc">Package · A to Z</option>
                          <option value="package-desc">Package · Z to A</option>
                          <option value="price-asc">Price · lowest first</option>
                          <option value="price-desc">Price · highest first</option>
                          <option value="seats-asc">Seats booked · fewest first</option>
                          <option value="seats-desc">Seats booked · most first</option>
                        </select>
                      </label>
                      <button className="btn-outline" type="submit">Sort</button>
                    </form>
                {visible.length ? (
                  <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Departure dates table">
                    <table role="table" className="admin-data-table admin-departures-table">
                      <thead role="rowgroup"><tr role="row">
                        {columns.map(([name, label]) => {
                          const Icon = column !== name ? ArrowDownUp : order === "asc" ? ArrowUp : ArrowDown;
                          return <th key={name} role="columnheader" scope="col"
                            aria-sort={column === name ? order === "asc" ? "ascending" : "descending" : undefined}>
                            <Link className="admin-sort-link" href={sortHref(name)}>{label}<Icon size={14} aria-hidden /></Link>
                          </th>;
                        })}
                        <th role="columnheader" scope="col" className="admin-table-actions">Actions</th>
                      </tr></thead>
                      <tbody role="rowgroup">
                        {visible.slice((page - 1) * pageSize, page * pageSize).map((departure) => {
                          const tour = packageBySlug.get(departure.tourSlug);
                          const date = dateLabel(departure.startDate);
                          return (
                            <tr role="row" key={departure._id} className="admin-clickable-row">
                              <td role="cell" className="admin-departure-date"><Link className="admin-data-link admin-departure-date-link admin-row-link" aria-label={`Details for ${date}, ${titleFor(departure.tourSlug)}`} href={`/admin/departures/${departure._id}`}>{date} <ArrowRight size={13} aria-hidden /></Link>{departure.note && <p>{departure.note}</p>}</td>
                              <td role="cell" className="admin-departure-package">{tour ? <AdminDeparturePackage tour={tour} /> : departure.tourSlug}</td>
                              <td role="cell" data-mobile-label="Price per person" className="whitespace-nowrap">{formatINR(departure.price)}</td>
                              <td role="cell" data-mobile-label="Seats booked" className="whitespace-nowrap"><strong>{departure.booked} / {departure.capacity}</strong>
                                <p>{past ? "Past departure" : departure.seatsLeft ? `${departure.seatsLeft} available` : "Sold out"}</p>
                              </td>
                              <td role="cell" className="admin-departure-actions"><div className="admin-table-actions">
                                <AdminDepartureEditor key={`${params.edit === departure._id ? "edit" : "closed"}-${params.flash ?? ""}`}
                                  packages={packages} selected={tour} departure={departure} unavailable={unavailable.filter((item) => item.tourSlug === departure.tourSlug)}
                                  minDate={today} returnTo={href({ page: page > 1 ? String(page) : "" })} defaultOpen={params.edit === departure._id} />
                                <AdminDeleteButton action={deleteDepartureAction} id={departure._id}
                                  fields={{ tourSlug: departure.tourSlug, returnTo: href({ page: page > 1 ? String(page) : "" }) }} confirmText={`Delete the departure on ${date}?`} compact />
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
                  </>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
