import type { TourAddon } from "@/lib/addons";

type SeedAddon = Omit<TourAddon, "id">;

const insurance: SeedAddon = {
  title: "Travel insurance",
  description: "Medical cover up to ₹5 lakh, trip cancellation and lost baggage.",
  price: 1450,
  unit: "person",
  icon: "shield",
  preselected: true,
};

const worldInsurance: SeedAddon = {
  ...insurance,
  description: "Overseas medical cover up to $50,000, trip cancellation and lost baggage.",
  price: 2900,
};

const privateRoom: SeedAddon = {
  title: "Private room upgrade",
  description: "A room to yourselves instead of sharing.",
  price: 9500,
  unit: "person",
  icon: "bed",
  preselected: false,
};

const airportPickup: SeedAddon = {
  title: "Private airport pickup",
  description: "A driver waiting at arrivals, just for your group.",
  price: 2200,
  unit: "booking",
  icon: "car",
  preselected: false,
};

/** Starter add-ons per package. Ids are stable so re-seeding keeps bookings readable. */
const byTour: Record<string, SeedAddon[]> = {
  "magical-kashmir": [
    insurance,
    { title: "Gondola phase 2", description: "Ride on to Apharwat peak. Usually sells out on the day.", price: 1800, unit: "person", icon: "mountain", preselected: false },
    { title: "Shikara sunset ride", description: "An hour on Dal Lake with kahwa as the light goes.", price: 1200, unit: "person", icon: "sailboat", preselected: false },
  ],
  "kerala-backwaters-kanyakumari": [
    insurance,
    { title: "Extra night on the houseboat", description: "Arrive a day early and settle in slowly.", price: 6200, unit: "person", icon: "sailboat", preselected: false },
    { title: "Ayurvedic massage", description: "A 60-minute Abhyanga session in Munnar.", price: 2500, unit: "person", icon: "sparkles", preselected: false },
  ],
  "royal-rajasthan": [
    insurance,
    { title: "Hot-air balloon over Jaipur", description: "A sunrise flight over Amer Fort and the Aravallis.", price: 12500, unit: "person", icon: "plane", preselected: false },
    { title: "Desert camp dinner", description: "Folk music and a Rajasthani thali under the stars.", price: 2800, unit: "person", icon: "utensils", preselected: false },
  ],
  "leh-ladakh-winter-wonderland": [
    insurance,
    { title: "Oxygen cylinder kit", description: "Portable oxygen for high passes, kept in your vehicle.", price: 1500, unit: "booking", icon: "shield", preselected: false },
    privateRoom,
  ],
  "shimla-manali-kasauli": [
    insurance,
    { title: "Paragliding in Solang", description: "A tandem flight with a certified pilot.", price: 3500, unit: "person", icon: "mountain", preselected: false },
    privateRoom,
  ],
  "meghalaya-assam-explorer": [
    insurance,
    { title: "Kaziranga jeep safari", description: "An extra morning safari in the central range.", price: 4200, unit: "person", icon: "car", preselected: false },
    { title: "Photo walk with a local", description: "Living root bridges with a photographer from Nongriat.", price: 1800, unit: "person", icon: "camera", preselected: false },
  ],
  "andaman-swaraj-dweep": [
    insurance,
    { title: "Scuba dive at Havelock", description: "A beginner dive with a PADI instructor. No experience needed.", price: 4500, unit: "person", icon: "sailboat", preselected: false },
    airportPickup,
  ],
  "best-of-europe": [
    worldInsurance,
    { title: "Eiffel Tower summit tickets", description: "Skip-the-line tickets to the very top.", price: 5400, unit: "person", icon: "ticket", preselected: false },
    privateRoom,
  ],
  "swiss-paris-amsterdam": [
    worldInsurance,
    { title: "Jungfraujoch excursion", description: "The cogwheel railway to the Top of Europe.", price: 14500, unit: "person", icon: "mountain", preselected: false },
    { title: "Amsterdam canal cruise", description: "An evening cruise with drinks and snacks.", price: 3200, unit: "person", icon: "sailboat", preselected: false },
  ],
  "dubai-abu-dhabi": [
    worldInsurance,
    { title: "Burj Khalifa at the top", description: "Level 124 and 125 tickets at sunset.", price: 4800, unit: "person", icon: "ticket", preselected: false },
    { title: "Dhow cruise dinner", description: "A buffet dinner on Dubai Marina.", price: 3500, unit: "person", icon: "utensils", preselected: false },
  ],
  "bali-bliss-honeymoon": [
    worldInsurance,
    { title: "Floating breakfast", description: "Breakfast served in your private pool villa.", price: 4500, unit: "booking", icon: "utensils", preselected: false },
    { title: "Couple's photoshoot", description: "Two hours with a photographer at Tegallalang.", price: 8500, unit: "booking", icon: "camera", preselected: false },
  ],
  "japan-cherry-blossom": [
    worldInsurance,
    { title: "JR Pass upgrade to Green Car", description: "First-class seats on every bullet train.", price: 16000, unit: "person", icon: "plane", preselected: false },
    { title: "Tea ceremony in Kyoto", description: "A private ceremony in a Gion teahouse.", price: 4200, unit: "person", icon: "sparkles", preselected: false },
  ],
  "maldives-overwater-escape": [
    worldInsurance,
    { title: "Seaplane transfer", description: "Swap the speedboat for a scenic seaplane ride.", price: 38000, unit: "person", icon: "plane", preselected: false },
    { title: "Sandbank dinner", description: "A private candlelit dinner on a sandbank.", price: 22000, unit: "booking", icon: "utensils", preselected: false },
  ],
  "northern-lights-iceland": [
    worldInsurance,
    { title: "Blue Lagoon premium", description: "Entry with a robe, drink and silica mask.", price: 11500, unit: "person", icon: "sparkles", preselected: false },
    { title: "Super-jeep aurora chase", description: "A small-group night hunt away from the coach.", price: 13500, unit: "person", icon: "car", preselected: false },
  ],
  "keralam-womens-special": [
    insurance,
    { title: "Kathakali backstage pass", description: "Watch the artists put on their make-up before the show.", price: 900, unit: "person", icon: "ticket", preselected: false },
    privateRoom,
  ],
  "sri-lanka-ramayana-trail": [
    worldInsurance,
    { title: "Yala safari", description: "A half-day jeep safari for leopards and elephants.", price: 6500, unit: "person", icon: "car", preselected: false },
    airportPickup,
  ],
};

export function seedAddonsFor(slug: string): TourAddon[] {
  return (byTour[slug] ?? []).map((addon, index) => ({ ...addon, id: `seed-${slug.slice(0, 24)}-${index + 1}` }));
}
