import type { TourAddon } from "./addons";

/** Snapshot of an add-on as it was charged on a booking. */
export type BookingAddon = {
  id: string;
  title: string;
  price: number;
  unit: TourAddon["unit"];
  quantity: number;
  total: number;
};

/** What the booking flow needs to know about a discount, client or server. */
export type DiscountRule = {
  id: string;
  name: string;
  code?: string;
  kind: "percent" | "fixed";
  value: number;
  maxAmount?: number;
  minTravellers: number;
};

export const GST_RATE = 0.05;

/** Paying travellers for per-person add-ons. Infants ride free. */
export function addonQuantity(addon: Pick<TourAddon, "unit">, adults: number, children: number) {
  return addon.unit === "booking" ? 1 : adults + children;
}

export function discountAmount(rule: DiscountRule, fare: number, travellers: number) {
  if (travellers < rule.minTravellers || fare <= 0) return 0;
  const raw = rule.kind === "percent" ? Math.round((fare * Math.min(100, rule.value)) / 100) : rule.value;
  const capped = rule.kind === "percent" && rule.maxAmount ? Math.min(raw, rule.maxAmount) : raw;
  return Math.max(0, Math.min(fare, capped));
}

/** Picks the rule that saves the most on this fare. */
export function bestDiscount(rules: DiscountRule[], fare: number, travellers: number) {
  let best: { rule: DiscountRule; amount: number } | undefined;
  for (const rule of rules) {
    const amount = discountAmount(rule, fare, travellers);
    if (amount > 0 && (!best || amount > best.amount)) best = { rule, amount };
  }
  return best;
}

export type QuoteInput = {
  adultFare: number;
  childFare: number;
  infantFare: number;
  adults: number;
  children: number;
  infants: number;
  addons: TourAddon[];
  selectedAddonIds: string[];
  discounts: DiscountRule[];
};

/** One price calculation shared by the checkout page and the bookings API. */
export function quoteBooking(input: QuoteInput) {
  const { adults, children, infants } = input;
  const travellers = adults + children + infants;
  const fare = input.adultFare * adults + input.childFare * children + input.infantFare * infants;
  const addons: BookingAddon[] = input.addons
    .filter((addon) => input.selectedAddonIds.includes(addon.id))
    .map((addon) => {
      const quantity = addonQuantity(addon, adults, children);
      return { id: addon.id, title: addon.title, price: addon.price, unit: addon.unit, quantity, total: addon.price * quantity };
    });
  const addonTotal = addons.reduce((sum, addon) => sum + addon.total, 0);
  const discount = bestDiscount(input.discounts, fare, travellers);
  const subtotal = fare + addonTotal - (discount?.amount ?? 0);
  const gst = Math.round(subtotal * GST_RATE);
  return { travellers, fare, addons, addonTotal, discount, subtotal, gst, total: subtotal + gst };
}
