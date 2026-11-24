export type SeedDiscount = {
  name: string;
  code?: string;
  kind: "percent" | "fixed";
  value: number;
  maxAmount?: number;
  /** Omit for all packages. */
  tourSlugs?: string[];
  minTravellers?: number;
  startsOn?: string;
  endsOn?: string;
  usageLimit?: number;
};

export const seedDiscounts: SeedDiscount[] = [
  { name: "Early bird", code: "EARLYBIRD", kind: "percent", value: 10, maxAmount: 10000 },
  { name: "Group of 6 or more", kind: "percent", value: 5, minTravellers: 6 },
  {
    name: "Honeymoon special",
    code: "HONEYMOON",
    kind: "fixed",
    value: 7500,
    tourSlugs: ["bali-bliss-honeymoon", "maldives-overwater-escape", "magical-kashmir"],
  },
  {
    name: "Kerala monsoon offer",
    code: "MONSOON",
    kind: "percent",
    value: 12,
    maxAmount: 8000,
    tourSlugs: ["kerala-backwaters-kanyakumari", "keralam-womens-special"],
    endsOn: "2027-09-30",
    usageLimit: 50,
  },
];
