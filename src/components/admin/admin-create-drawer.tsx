"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, X } from "lucide-react";

export function AdminCreateDrawer({ entity, children }: {
  entity: string;
  children: (controls: { close: () => void; initialFocus: RefObject<HTMLInputElement | null> }) => ReactNode;
}) {
  const initialFocus = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen} disablePointerDismissal>
      <Dialog.Trigger className="btn-outline"><Plus size={16} aria-hidden /> New {entity}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="admin-drawer-backdrop" />
        <Dialog.Popup initialFocus={initialFocus} className="admin-studio admin-drawer">
          <header className="admin-drawer-header">
            <Dialog.Title>New {entity}</Dialog.Title>
            <Dialog.Close className="admin-icon-button" aria-label={`Close ${entity} form`}><X size={18} /></Dialog.Close>
          </header>
          {children({ close: () => setOpen(false), initialFocus })}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
