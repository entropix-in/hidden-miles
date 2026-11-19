import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function adminPageNumber(value: string | string[] | undefined, lastPage: number) {
  const page = typeof value === "string" ? Number(value) : 1;
  return Number.isSafeInteger(page) ? Math.min(lastPage, Math.max(1, page)) : 1;
}

export function AdminListPagination({ path, filters, page, total, pageSize }: {
  path: string;
  filters: URLSearchParams;
  page: number;
  total: number;
  pageSize: number;
}) {
  if (total <= pageSize) return null;
  function href(target: number) {
    const params = new URLSearchParams(filters);
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  return (
    <nav className="admin-list-pagination" aria-label="Pagination">
      <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
      <div className="flex flex-wrap gap-2">
        {page > 1 && <Link className="btn-outline" href={href(page - 1)}><ChevronLeft size={16} /> Previous</Link>}
        {page * pageSize < total && <Link className="btn-outline" href={href(page + 1)}>Next <ChevronRight size={16} /></Link>}
      </div>
    </nav>
  );
}
