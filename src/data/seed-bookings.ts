export type SeedDeparture = {
  tourSlug: string;
  startDate: string;
  price: number;
  capacity: number;
  note?: string;
};

export type SeedBooking = {
  tourSlug: string;
  startDate: string;
  name: string;
  email: string;
  phone: string;
  travellers: number;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
};

/**
 * Starter departures used by `pnpm db:seed`.
 *
 * Dates are fixed so repeated safe seeds do not create duplicates. They are
 * intentionally far enough ahead to appear on the public website.
 */
export const seedDepartures: SeedDeparture[] = [
  {
    tourSlug: "magical-kashmir",
    startDate: "2027-01-09",
    price: 36990,
    capacity: 26,
    note: "Winter houseboat special",
  },
  {
    tourSlug: "magical-kashmir",
    startDate: "2027-02-13",
    price: 36990,
    capacity: 26,
  },
  {
    tourSlug: "kerala-backwaters-kanyakumari",
    startDate: "2027-01-16",
    price: 63990,
    capacity: 24,
  },
  {
    tourSlug: "royal-rajasthan",
    startDate: "2027-01-23",
    price: 46990,
    capacity: 22,
  },
  {
    tourSlug: "leh-ladakh-winter-wonderland",
    startDate: "2027-02-06",
    price: 107990,
    capacity: 16,
    note: "Snow leopard season",
  },
  {
    tourSlug: "andaman-swaraj-dweep",
    startDate: "2027-01-18",
    price: 75990,
    capacity: 20,
  },
  {
    tourSlug: "best-of-europe",
    startDate: "2027-05-15",
    price: 375790,
    capacity: 28,
  },
  {
    tourSlug: "swiss-paris-amsterdam",
    startDate: "2027-04-18",
    price: 247690,
    capacity: 24,
  },
  {
    tourSlug: "dubai-abu-dhabi",
    startDate: "2027-02-14",
    price: 133740,
    capacity: 24,
  },
  {
    tourSlug: "bali-bliss-honeymoon",
    startDate: "2027-01-11",
    price: 89990,
    capacity: 20,
  },
  {
    tourSlug: "japan-cherry-blossom",
    startDate: "2027-03-27",
    price: 229990,
    capacity: 18,
  },
  {
    tourSlug: "maldives-overwater-escape",
    startDate: "2027-01-18",
    price: 149990,
    capacity: 12,
  },
  {
    tourSlug: "northern-lights-iceland",
    startDate: "2027-02-10",
    price: 279990,
    capacity: 16,
  },
  {
    tourSlug: "keralam-womens-special",
    startDate: "2027-01-24",
    price: 63990,
    capacity: 20,
  },
  {
    tourSlug: "sri-lanka-ramayana-trail",
    startDate: "2027-02-07",
    price: 119190,
    capacity: 20,
  },
];

/**
 * Sample booking requests linked to the departures above.
 * Amounts are calculated from the departure price × travellers.
 */
export const seedBookings: SeedBooking[] = [
  {
    tourSlug: "magical-kashmir",
    startDate: "2027-01-09",
    name: "Ananya Deshpande",
    email: "ananya.deshpande@example.com",
    phone: "+91 98200 11001",
    travellers: 2,
    status: "confirmed",
    notes: "Anniversary trip — houseboat preferred.",
  },
  {
    tourSlug: "bali-bliss-honeymoon",
    startDate: "2027-01-11",
    name: "Rohan & Meera Shah",
    email: "rohan.meera@example.com",
    phone: "+91 98200 11002",
    travellers: 2,
    status: "confirmed",
    notes: "Honeymoon; please arrange a private dinner.",
  },
  {
    tourSlug: "keralam-womens-special",
    startDate: "2027-01-24",
    name: "Lakshmi Iyer",
    email: "lakshmi.iyer@example.com",
    phone: "+91 98200 11003",
    travellers: 1,
    status: "pending",
    notes: "Solo traveller, vegetarian meals.",
  },
  {
    tourSlug: "best-of-europe",
    startDate: "2027-05-15",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@example.com",
    phone: "+91 98200 11004",
    travellers: 4,
    status: "confirmed",
    notes: "Two adults and two teenagers.",
  },
  {
    tourSlug: "sri-lanka-ramayana-trail",
    startDate: "2027-02-07",
    name: "Farida Qureshi",
    email: "farida.qureshi@example.com",
    phone: "+91 98200 11005",
    travellers: 3,
    status: "confirmed",
    notes: "Travelling with elderly parents.",
  },
  {
    tourSlug: "leh-ladakh-winter-wonderland",
    startDate: "2027-02-06",
    name: "Sanjay Kulkarni",
    email: "sanjay.kulkarni@example.com",
    phone: "+91 98200 11006",
    travellers: 2,
    status: "pending",
    notes: "Snow leopard sighting is a priority.",
  },
  {
    tourSlug: "magical-kashmir",
    startDate: "2027-02-13",
    name: "Aditya Maurya",
    email: "aditya.maurya@example.com",
    phone: "+91 86386 65064",
    travellers: 3,
    status: "pending",
    notes: "City: Mumbai. Add-ons: insurance.",
  },
  {
    tourSlug: "maldives-overwater-escape",
    startDate: "2027-01-18",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    phone: "+91 98200 11008",
    travellers: 2,
    status: "confirmed",
    notes: "Overwater villa, late checkout requested.",
  },
  {
    tourSlug: "northern-lights-iceland",
    startDate: "2027-02-10",
    name: "Neha & Arjun Rao",
    email: "neha.arjun@example.com",
    phone: "+91 98200 11009",
    travellers: 2,
    status: "cancelled",
    notes: "Cancelled due to work commitments.",
  },
  {
    tourSlug: "japan-cherry-blossom",
    startDate: "2027-03-27",
    name: "Kabir Mehta",
    email: "kabir.mehta@example.com",
    phone: "+91 98200 11010",
    travellers: 2,
    status: "pending",
    notes: "Vegetarian meals and window seats.",
  },
  {
    tourSlug: "royal-rajasthan",
    startDate: "2027-01-23",
    name: "Ritu & Amit Bansal",
    email: "ritu.amit@example.com",
    phone: "+91 98200 11011",
    travellers: 2,
    status: "confirmed",
    notes: "Palace stay upgrade requested.",
  },
  {
    tourSlug: "andaman-swaraj-dweep",
    startDate: "2027-01-18",
    name: "Joanne D'Souza",
    email: "joanne.dsouza@example.com",
    phone: "+91 98200 11012",
    travellers: 3,
    status: "confirmed",
    notes: "Two adults and one child.",
  },
];
