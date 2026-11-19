"use client";

import { useId, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { AdminNav } from "./admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar({ brand, actions }: { brand: ReactNode; actions: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <aside className="admin-sidebar px-4 py-3 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:p-4">
      <div className="flex items-center justify-between gap-3">
        {brand}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          className="btn-outline lg:hidden!"
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
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-200 pt-3 lg:mt-0 lg:grid lg:pt-4">
          {actions}
        </div>
      </div>
    </aside>
  );
}
