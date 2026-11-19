import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function adminPageNumber(value: string | string[] | undefined, lastPage: number) {
  const page = typeof value === "string" ? Number(value) : 1;
  return Number.isSafeInteger(page) ? Math.min(lastPage, Math.max(1, page)) : 1;
}

function pageItems(page: number, lastPage: number): Array<number | "gap"> {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const items: Array<number | "gap"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(lastPage - 1, page + 1);

  if (start > 2) items.push("gap");
  for (let item = start; item <= end; item += 1) items.push(item);
  if (end < lastPage - 1) items.push("gap");
  items.push(lastPage);

  return items;
}

export function AdminListPagination({ path, filters, page, total, pageSize }: {
  path: string;
  filters: URLSearchParams;
  page: number;
  total: number;
  pageSize: number;
}) {
  if (!total) return null;

  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  function href(target: number) {
    const params = new URLSearchParams(filters);
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  return (
    <nav className="admin-list-pagination" aria-label="Pagination">
      <span>
        Showing {first}–{last} of {total}
      </span>
      <div className="admin-pagination-pages">
        {page > 1 && (
          <Link className="btn-outline" href={href(page - 1)} aria-label="Previous page">
            <ChevronLeft size={16} aria-hidden />
            <span className="admin-page-arrow-label">Previous</span>
          </Link>
        )}

        <div className="admin-page-numbers">
          {pageItems(page, lastPage).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="admin-page-gap" aria-hidden="true">
                …
              </span>
            ) : item === page ? (
              <span key={item} className="admin-page-number" aria-current="page">
                {item}
              </span>
            ) : (
              <Link
                key={item}
                className="admin-page-number"
                href={href(item)}
                aria-label={`Page ${item}`}
              >
                {item}
              </Link>
            ),
          )}
        </div>

        {page < lastPage && (
          <Link className="btn-outline" href={href(page + 1)} aria-label="Next page">
            <span className="admin-page-arrow-label">Next</span>
            <ChevronRight size={16} aria-hidden />
          </Link>
        )}
      </div>
    </nav>
  );
}
