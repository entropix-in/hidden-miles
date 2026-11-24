export const addonIconLabels = {
  shield: "Insurance",
  mountain: "Activity",
  sailboat: "Water",
  bed: "Stay",
  utensils: "Meals",
  car: "Transfer",
  plane: "Flight",
  camera: "Photo",
  ticket: "Ticket",
  sparkles: "Special",
} as const;

export type AddonIcon = keyof typeof addonIconLabels;

export type TourAddon = {
  /** Stable id so bookings and saved selections survive edits. */
  id: string;
  title: string;
  description: string;
  price: number;
  /** Charged for every traveller (infants excluded) or once per booking. */
  unit: "person" | "booking";
  icon: AddonIcon;
  /** Switched on when the traveller reaches the add-ons step. */
  preselected: boolean;
};

export const MAX_ADDONS = 12;

export function newAddonId() {
  return `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Parses the JSON posted by the admin add-ons editor. Invalid rows are dropped and values clamped. */
export function parseTourAddons(raw: string): TourAddon[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const addons: TourAddon[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    const title = typeof candidate.title === "string" ? candidate.title.trim().slice(0, 120) : "";
    if (!title) continue;
    const rawId = typeof candidate.id === "string" ? candidate.id.trim() : "";
    const id = /^[a-z0-9_-]{1,40}$/i.test(rawId) && !addons.some((addon) => addon.id === rawId)
      ? rawId : newAddonId();
    const icon = typeof candidate.icon === "string" && Object.hasOwn(addonIconLabels, candidate.icon)
      ? candidate.icon as AddonIcon : "sparkles";
    addons.push({
      id,
      title,
      description: typeof candidate.description === "string" ? candidate.description.trim().slice(0, 240) : "",
      price: Math.min(1_000_000, Math.max(0, Math.round(Number(candidate.price) || 0))),
      unit: candidate.unit === "booking" ? "booking" : "person",
      icon,
      preselected: candidate.preselected === true,
    });
    if (addons.length === MAX_ADDONS) break;
  }
  return addons;
}
