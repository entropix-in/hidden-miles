"use client";

import { useId, useState, type RefObject } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { persistDestinationAction } from "@/app/admin/actions";
import { AdminCreateDrawer } from "./admin-create-drawer";
import { AdminRichField } from "./admin-rich-fields";
import { AdminAuthoringForm } from "./admin-authoring-form";
import { AdminPageUrl } from "./admin-page-url";
import { AdminSelect } from "./admin-select";
import { CoverPhotoField } from "./admin-photo-upload";

export type DestinationOption = {
  slug: string;
  name: string;
  region: "India" | "International";
};

export function DestinationPicker({ options, initial }: {
  options: DestinationOption[];
  initial?: DestinationOption;
}) {
  const id = useId();
  const [created, setCreated] = useState<DestinationOption[]>([]);
  const [selected, setSelected] = useState(initial?.slug ?? null);
  const all = [...options.filter((option) => !created.some((item) => item.slug === option.slug)), ...created];
  if (initial && !all.some(({ slug }) => slug === initial.slug)) all.push(initial);
  all.sort((a, b) => a.name.localeCompare(b.name));
  const items = all.map(({ slug, name }) => ({ value: slug, label: name }));
  const destination = all.find(({ slug }) => slug === selected);

  return (
    <div className="min-w-0 sm:col-span-2">
      <label className="field-label" htmlFor={id}>Destination</label>
      <div className="admin-destination-row">
        <Select.Root items={items} name="destinationSlug" required value={selected} onValueChange={setSelected}>
          <Select.Trigger id={id} className="field admin-destination-trigger">
            <MapPin size={16} aria-hidden />
            <Select.Value placeholder="Choose a destination" />
            <Select.Icon><ChevronDown size={16} /></Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner className="admin-select-positioner" alignItemWithTrigger={false} sideOffset={4}>
              <Select.Popup className="admin-studio admin-select-popup">
                <Select.List>
                  {all.map(({ slug, name, region }) => (
                    <Select.Item key={slug} value={slug} className="admin-select-item">
                      <Select.ItemText>{name}</Select.ItemText>
                      <small>{region}</small>
                      <Select.ItemIndicator><Check size={15} /></Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <AdminCreateDrawer entity="destination">
          {({ close, initialFocus }) => (
            <DestinationDraft nameField={initialFocus} onSave={(option) => {
              setCreated((current) => [...current, option]);
              setSelected(option.slug);
              close();
            }} />
          )}
        </AdminCreateDrawer>
      </div>
      {destination && <p className="admin-editor-help mt-1.5">{destination.region}</p>}
    </div>
  );
}

function DestinationDraft({ nameField, onSave }: {
  nameField: RefObject<HTMLInputElement | null>;
  onSave: (option: DestinationOption) => void;
}) {
  const id = useId();
  const [name, setName] = useState("");

  return (
    <AdminAuthoringForm label="New destination" submitLabel="Create destination"
      action={async (formData) => {
        const result = await persistDestinationAction(formData);
        if (result.destination) onSave(result.destination);
        return { error: result.error ?? "" };
      }}
      cancel={<Dialog.Close className="btn-outline">Cancel</Dialog.Close>}>
      <div>
        <label className="field-label" htmlFor={id}>Name</label>
        <input ref={nameField} className="field" id={id} name="name" value={name} required maxLength={190}
          onChange={(event) => setName(event.target.value)} />
      </div>
      <AdminPageUrl prefix="/destinations/" title={name} />
      <div>
        <label className="field-label" htmlFor={id + "-region"}>Region</label>
        <AdminSelect id={id + "-region"} name="region" defaultValue="India">
          <option value="India">India</option>
          <option value="International">International</option>
        </AdminSelect>
      </div>
      <AdminRichField name="description" label="Short description" />
      <CoverPhotoField />
    </AdminAuthoringForm>
  );
}
