"use client";

import { useId, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { AdminNav } from "./admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar({ brand, actions }: { brand: ReactNode; actions: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <aside className="bg-navy-950 px-4 py-3 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-5">
      <div className="flex items-center justify-between gap-3">
        {brand}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 px-3 text-[13px] font-semibold text-white lg:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
          Menu
        </button>
      </div>

      <div id={id} className={cn(
        "mt-3 flex-col lg:mt-7 lg:flex lg:flex-1",
        open ? "flex" : "hidden",
      )}>
        <div className="lg:flex-1">
          <p className="mb-2 hidden px-2 text-xs font-semibold text-sand-200/75 lg:block">
            Admin workspace
          </p>
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3 lg:mt-0 lg:grid lg:pt-4">
          {actions}
        </div>
      </div>
    </aside>
  );
}
