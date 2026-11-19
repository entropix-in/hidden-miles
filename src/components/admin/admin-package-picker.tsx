"use client";

import { useId, useMemo } from "react";
import Image from "next/image";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, Package, Search, X } from "lucide-react";
import type { AdminTour } from "@/lib/types";
import { formatINR, imageUrl } from "@/lib/utils";

export type PackageOption = Pick<AdminTour, "slug" | "title" | "image" | "price" | "destinationName">;

export function AdminPackagePicker({ packages, label = "Package", name, selected, onSelect, placeholder = "Search packages" }: {
  packages: PackageOption[];
  label?: string;
  name?: string;
  selected?: string;
  onSelect?: (option: PackageOption | null) => void;
  placeholder?: string;
}) {
  const id = useId();
  const items = useMemo(() => [...packages].sort((a, b) => a.title.localeCompare(b.title)), [packages]);

  return (
    <div className="min-w-0">
      <Combobox.Root items={items} autoHighlight name={name} defaultValue={items.find((item) => item.slug === selected) ?? null}
        itemToStringLabel={(item) => item.title} itemToStringValue={(item) => item.slug}
        filter={(item, query) => `${item.title} ${item.destinationName} ${item.slug}`.toLowerCase().includes(query.trim().toLowerCase())}
        onValueChange={onSelect}>
        <label className="field-label" htmlFor={id}>{label}</label>
        <Combobox.InputGroup className="admin-package-input">
          <Search size={16} aria-hidden />
          <Combobox.Input id={id} className="field" placeholder={placeholder} autoComplete="off" />
          <Combobox.Clear className="admin-package-clear" aria-label="Clear package"><X size={15} /></Combobox.Clear>
          <Combobox.Trigger className="admin-package-trigger" aria-label="Show packages"><ChevronDown size={16} /></Combobox.Trigger>
        </Combobox.InputGroup>
        <Combobox.Portal>
          <Combobox.Positioner className="admin-package-positioner" sideOffset={5}>
            <Combobox.Popup className="admin-studio admin-package-popup">
              <Combobox.Empty className="admin-package-empty">No packages match your search.</Combobox.Empty>
              <Combobox.List className="admin-package-options">
                {(item: PackageOption) => (
                  <Combobox.Item key={item.slug} value={item} className="admin-package-option">
                    <span className="admin-package-option-image">
                      {item.image ? <Image src={imageUrl(item.image, 160)} alt="" fill sizes="44px" className="object-cover" />
                        : <Package size={18} aria-hidden />}
                    </span>
                    <span className="min-w-0">
                      <span className="admin-package-option-title">{item.title}</span>
                      <span className="admin-package-option-meta">{item.destinationName} · {formatINR(item.price)} / person</span>
                    </span>
                    <Combobox.ItemIndicator><Check size={16} aria-hidden /></Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
