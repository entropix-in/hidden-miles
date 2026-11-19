"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";

export function AdminBookingSortButton({ label, href, direction }: {
  label: string;
  href: string;
  direction?: "asc" | "desc";
}) {
  const router = useRouter();
  const Icon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowDownUp;
  return (
    <button type="button" className="admin-sort-link" onClick={() => router.push(href, { scroll: false })}>
      {label}<Icon size={14} aria-hidden />
    </button>
  );
}
