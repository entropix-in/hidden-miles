export type ItineraryBadgeKind =
  | "meal"
  | "stay"
  | "travel"
  | "experience"
  | "leisure";

export type ItineraryBadge = {
  label: string;
  kind: ItineraryBadgeKind;
};

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  badges?: ItineraryBadge[];
};

export type Tour = {
  slug: string;
  title: string;
  destinationSlug: string;
  destinationName: string;
  region: "India" | "International";
  experiences: string[];
  image: string;
  nights: number;
  days: number;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  departure: string;
  groupSize: string;
  summary: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  featured?: boolean;
};

const indiaInclusions = [
  "Handpicked 4-star stays with daily breakfast",
  "All airport and inter-city transfers",
  "Private air-conditioned vehicle for sightseeing",
  "Experienced English-speaking tour leader",
  "Monument fees and listed experiences",
  "Daily bottled water and onboard assistance",
  "24×7 on-trip support team",
];

const worldInclusions = [
  "Return economy flights and airport taxes",
  "Handpicked 4-star and 5-star stays",
  "Daily breakfast plus listed meals",
  "All transfers, trains and coach travel",
  "Expert tour leader throughout the journey",
  "Sightseeing tickets and listed experiences",
  "Travel insurance and 24×7 on-trip support",
];

const standardExclusions = [
  "Visa fees unless mentioned in inclusions",
  "Lunches, dinners and personal expenses",
  "Optional activities and upgrades",
  "Anything not listed under inclusions",
];

export const tours: Tour[] = [
  {
    slug: "magical-kashmir",
    title: "Magical Kashmir",
    destinationSlug: "kashmir",
    destinationName: "Kashmir",
    region: "India",
    experiences: ["family", "honeymoon", "spiritual"],
    image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b",
    nights: 5,
    days: 6,
    price: 36990,
    oldPrice: 42990,
    rating: 4.9,
    reviews: 214,
    badge: "Best Seller",
    departure: "Every Saturday",
    groupSize: "16–26 guests",
    summary:
      "Six days in the valley of kings: a night on Dal Lake, the meadows of Gulmarg, the pine navys of Pahalgam and the gardens of Srinagar. A gentle, beautiful introduction to Kashmir for families and couples alike.",
    highlights: [
      "Overnight stay on a traditional Dal Lake houseboat",
      "Gondola ride to Apharwat Peak in Gulmarg",
      "Betaab Valley and Aru Valley excursion in Pahalgam",
      "Mughal gardens of Nishat and Shalimar Bagh",
      "Kashmiri wazwan dinner with a local family",
    ],
    inclusions: indiaInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Srinagar · Dal Lake",
        description:
          "Meet your tour leader at Srinagar airport, transfer to a heritage houseboat and spend the evening on a shikara ride through the floating gardens.",
      },
      {
        day: 2,
        title: "Srinagar · Mughal Gardens",
        description:
          "Explore Nishat Bagh, Shalimar Bagh and the old city, with time for papier-mâché and pashmina workshops in the afternoon.",
      },
      {
        day: 3,
        title: "Gulmarg · Gondola Ride",
        description:
          "Drive through rice fields to Gulmarg and ride the gondola to Apharwat for views across the Pir Panjal range. Return to Srinagar for a relaxed evening.",
      },
      {
        day: 4,
        title: "Pahalgam · Betaab & Aru Valley",
        description:
          "A full day among the pines and rivers of Pahalgam, with stops at Betaab Valley and Aru Valley. Evening at leisure in Srinagar.",
      },
      {
        day: 5,
        title: "Doodhpathri · Wazwan Dinner",
        description:
          "Visit the quiet meadows of Doodhpathri before a farewell Kashmiri wazwan dinner hosted by a local family.",
      },
      {
        day: 6,
        title: "Depart Srinagar",
        description:
          "A leisurely breakfast, last-minute shopping at the floating market and transfer to the airport for your flight home.",
      },
    ],
  },
  {
    slug: "kerala-backwaters-kanyakumari",
    title: "Keralam Kanyakumari",
    destinationSlug: "kerala",
    destinationName: "Kerala",
    region: "India",
    experiences: ["family", "spiritual", "honeymoon"],
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
    nights: 7,
    days: 8,
    price: 63990,
    oldPrice: 71990,
    rating: 4.8,
    reviews: 186,
    badge: "Best Seller",
    departure: "12 Dec · 09 Jan · 06 Feb",
    groupSize: "18–30 guests",
    summary:
      "From the tea hills of Munnar to an overnight backwater cruise and the southern tip of India at Kanyakumari. A slow, green journey through Kerala's most loved landscapes.",
    highlights: [
      "Overnight houseboat cruise through the Alleppey backwaters",
      "Tea estate walk and tasting in Munnar",
      "Periyar wildlife sanctuary boat safari",
      "Sunrise at Kanyakumari's Vivekananda Rock",
      "Kathakali performance and Kerala sadya lunch",
    ],
    inclusions: indiaInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Kochi · Fort Kochi Walk",
        description:
          "Arrive in Kochi and explore Fort Kochi's colonial lanes, Chinese fishing nets and spice markets before an evening Kathakali performance.",
      },
      {
        day: 2,
        title: "Kochi to Munnar",
        description:
          "Drive into the Western Ghats with stops at Cheeyappara waterfalls, arriving in Munnar for a tea estate walk and tasting.",
      },
      {
        day: 3,
        title: "Munnar · Tea Country",
        description:
          "Visit Mattupetty Dam, Echo Point and the Eravikulam National Park, home to the endangered Nilgiri tahr.",
      },
      {
        day: 4,
        title: "Munnar to Thekkady",
        description:
          "Travel to Thekkady for a spice plantation tour and an afternoon boat safari through Periyar Wildlife Sanctuary.",
      },
      {
        day: 5,
        title: "Thekkady to Alleppey",
        description:
          "Board a private houseboat for an overnight cruise through the backwaters, with fresh Kerala meals cooked on board.",
      },
      {
        day: 6,
        title: "Alleppey to Kovalam",
        description:
          "Disembark after breakfast and drive south to Kovalam for a relaxed afternoon on Lighthouse Beach.",
      },
      {
        day: 7,
        title: "Kanyakumari Day Trip",
        description:
          "Visit Kanyakumari's Vivekananda Rock and the Gandhi Memorial, returning to Kovalam for a farewell seafood dinner.",
      },
      {
        day: 8,
        title: "Depart Trivandrum",
        description:
          "Transfer to Trivandrum airport for your flight home, with a final stop at a local coir and handicraft store.",
      },
    ],
  },
  {
    slug: "royal-rajasthan",
    title: "Royal Rajasthan",
    destinationSlug: "rajasthan",
    destinationName: "Rajasthan",
    region: "India",
    experiences: ["family", "luxury"],
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245",
    nights: 6,
    days: 7,
    price: 46990,
    oldPrice: 52990,
    rating: 4.8,
    reviews: 163,
    departure: "Every Friday",
    groupSize: "16–28 guests",
    summary:
      "Palaces in Jaipur, lakes in Udaipur and the blue lanes of Jodhpur. Seven days of royal history, craft bazaars and some of India's most photogenic sunsets.",
    highlights: [
      "Amber Fort with a private guide",
      "Udaipur boat ride on Lake Pichola",
      "Mehrangarh Fort and Jodhpur's blue city",
      "Rajasthani folk music and dinner",
      "Block-printing workshop in Jaipur",
    ],
    inclusions: indiaInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Jaipur",
        description:
          "Arrive in the Pink City and settle into your heritage hotel. Evening walk through the old bazaars and dinner at a rooftop restaurant.",
      },
      {
        day: 2,
        title: "Jaipur · Forts & Palaces",
        description:
          "Explore Amber Fort, Hawa Mahal and the City Palace with a local historian, followed by a block-printing workshop.",
      },
      {
        day: 3,
        title: "Jaipur to Jodhpur",
        description:
          "Drive to Jodhpur with a stop at Pushkar, arriving in time for sunset over the blue city from a rooftop café.",
      },
      {
        day: 4,
        title: "Jodhpur · Mehrangarh",
        description:
          "Tour Mehrangarh Fort and Jaswant Thada, then wander the blue lanes of the old town with time for shopping.",
      },
      {
        day: 5,
        title: "Jodhpur to Udaipur",
        description:
          "Travel via Ranakpur's marble Jain temples to Udaipur, the city of lakes, for a relaxed evening by Lake Pichola.",
      },
      {
        day: 6,
        title: "Udaipur · Lake City",
        description:
          "Visit the City Palace, Saheliyon Ki Bari and Jagdish Temple, then take a sunset boat ride on Lake Pichola.",
      },
      {
        day: 7,
        title: "Depart Udaipur",
        description:
          "Breakfast at leisure before your transfer to Udaipur airport for the journey home.",
      },
    ],
  },
  {
    slug: "leh-ladakh-winter-wonderland",
    title: "Ladakh Winter Wonderland",
    destinationSlug: "ladakh",
    destinationName: "Ladakh",
    region: "India",
    experiences: ["adventure"],
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2",
    nights: 7,
    days: 8,
    price: 107990,
    oldPrice: 118990,
    rating: 4.9,
    reviews: 98,
    badge: "Limited Seats",
    departure: "06 Feb · 20 Feb",
    groupSize: "10–16 guests",
    summary:
      "A winter expedition to frozen Pangong, snow leopard country and the quiet monasteries of the Indus Valley. For travellers who want Ladakh without the crowds.",
    highlights: [
      "Frozen Pangong Lake and Chadar views",
      "Snow leopard tracking in Hemis National Park",
      "Nubra Valley camel ride in the snow",
      "Thiksey Monastery morning prayers",
      "Local Ladakhi homestay dinner",
    ],
    inclusions: indiaInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Leh · Rest & Acclimatise",
        description:
          "Arrive in Leh and spend the day resting at altitude. A gentle evening walk through the old town and a briefing from your tour leader.",
      },
      {
        day: 2,
        title: "Leh · Monasteries",
        description:
          "Visit Thiksey, Hemis and Shey monasteries, with a slow afternoon back in Leh for cafés and local markets.",
      },
      {
        day: 3,
        title: "Leh to Nubra via Khardung La",
        description:
          "Cross the high Khardung La pass into Nubra Valley for a camel ride on the cold desert dunes and a night in Hunder.",
      },
      {
        day: 4,
        title: "Nubra to Pangong",
        description:
          "Drive via Shyok to the frozen shores of Pangong Lake, with time for photography and a warm cup of butter tea.",
      },
      {
        day: 5,
        title: "Pangong to Leh",
        description:
          "Return to Leh via Chang La with stops at Chemrey and Takthok monasteries. Evening at leisure.",
      },
      {
        day: 6,
        title: "Snow Leopard Tracking",
        description:
          "A full day with local spotters in Hemis National Park, scanning the ridges for snow leopards and Himalayan wildlife.",
      },
      {
        day: 7,
        title: "Leh · Free Day",
        description:
          "A flexible day for optional walks, souvenir shopping or simply resting before the farewell dinner.",
      },
      {
        day: 8,
        title: "Depart Leh",
        description:
          "Transfer to Kushok Bakula Rimpochee Airport for your flight home.",
      },
    ],
  },
  {
    slug: "shimla-manali-kasauli",
    title: "Shimla Manali with Kasauli",
    destinationSlug: "himachal",
    destinationName: "Himachal",
    region: "India",
    experiences: ["family", "honeymoon"],
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23",
    nights: 8,
    days: 9,
    price: 64990,
    oldPrice: 72990,
    rating: 4.7,
    reviews: 241,
    badge: "Best Seller",
    departure: "Every Sunday",
    groupSize: "20–32 guests",
    summary:
      "A classic Himalayan summer: the toy train to Shimla, the cafés and valleys of Manali and a quiet finish in the pine navys of Kasauli. Made for families.",
    highlights: [
      "UNESCO-listed Kalka–Shimla toy train",
      "Solang Valley and Atal Tunnel",
      "Hadimba Temple and Old Manali cafés",
      "Kasauli's colonial walking trails",
      "Family bonfire and barbecue evening",
    ],
    inclusions: indiaInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Chandigarh · Kasauli",
        description:
          "Arrive in Chandigarh and drive to the quiet hill town of Kasauli for a relaxed evening among the pines.",
      },
      {
        day: 2,
        title: "Kasauli to Shimla",
        description:
          "Morning walk to Monkey Point, then drive to Shimla. Evening stroll along the Mall Road and Ridge.",
      },
      {
        day: 3,
        title: "Shimla · Toy Train & Town",
        description:
          "Ride the scenic toy train to Kalka and back, then explore Christ Church, Jakhoo Temple and the colonial heritage walk.",
      },
      {
        day: 4,
        title: "Shimla to Manali",
        description:
          "Drive along the Sutlej to Manali, with stops at Sundernagar Lake and Pandoh Dam. Evening at leisure.",
      },
      {
        day: 5,
        title: "Manali · Solang Valley",
        description:
          "A day in Solang Valley with optional paragliding and zorbing, returning via the Atal Tunnel for a glimpse of Sissu.",
      },
      {
        day: 6,
        title: "Manali · Old Town",
        description:
          "Visit Hadimba Temple, Vashisht hot springs and the Tibetan monastery, with a free afternoon in Old Manali's cafés.",
      },
      {
        day: 7,
        title: "Manali · Free Day",
        description:
          "Choose between a river rafting session, a hike to Jogini Falls or a slow day of shopping on Mall Road.",
      },
      {
        day: 8,
        title: "Manali to Chandigarh",
        description:
          "Drive back to Chandigarh, stopping at Ropar Wetland, and settle in for a farewell dinner at the hotel.",
      },
      {
        day: 9,
        title: "Depart Chandigarh",
        description:
          "Transfer to Chandigarh airport or railway station for your onward journey.",
      },
    ],
  },
  {
    slug: "meghalaya-assam-explorer",
    title: "Meghalaya & Assam Explorer",
    destinationSlug: "north-east",
    destinationName: "North East",
    region: "India",
    experiences: ["adventure", "family"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
    nights: 6,
    days: 7,
    price: 54990,
    oldPrice: 61990,
    rating: 4.8,
    reviews: 121,
    departure: "14 Nov · 12 Dec · 16 Jan",
    groupSize: "12–20 guests",
    summary:
      "Waterfalls, living root bridges, tea estates and a Brahmaputra sunset. A week in the green heart of India's north-east, paced for curious travellers.",
    highlights: [
      "Double-decker living root bridge trek",
      "Nohkalikai and Elephant Falls",
      "Kaziranga jeep safari",
      "Brahmaputra river cruise at sunset",
      "Assam tea estate lunch",
    ],
    inclusions: indiaInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Guwahati · Shillong",
        description:
          "Arrive in Guwahati and drive to Shillong, stopping at Umiam Lake. Evening walk around Police Bazaar.",
      },
      {
        day: 2,
        title: "Shillong · Waterfalls",
        description:
          "Visit Elephant Falls, Shillong Peak and the Don Bosco Museum, with a local Khasi lunch in the afternoon.",
      },
      {
        day: 3,
        title: "Cherrapunji · Root Bridges",
        description:
          "Drive to Cherrapunji for Nohkalikai Falls and a guided trek to the double-decker living root bridge at Nongriat.",
      },
      {
        day: 4,
        title: "Cherrapunji · Caves & Falls",
        description:
          "Explore Mawsmai Cave, Seven Sisters Falls and the Bangladesh plains viewpoint before returning to Shillong.",
      },
      {
        day: 5,
        title: "Shillong to Kaziranga",
        description:
          "Travel to Kaziranga National Park, arriving for a relaxed evening at your jungle lodge.",
      },
      {
        day: 6,
        title: "Kaziranga Safari · Guwahati",
        description:
          "Early morning jeep safari for rhinos and wild elephants, then drive to Guwahati for a sunset Brahmaputra cruise.",
      },
      {
        day: 7,
        title: "Depart Guwahati",
        description:
          "Visit Kamakhya Temple before your transfer to the airport for the journey home.",
      },
    ],
  },
  {
    slug: "andaman-swaraj-dweep",
    title: "Andaman with Swaraj Dweep",
    destinationSlug: "andaman",
    destinationName: "Andaman",
    region: "India",
    experiences: ["honeymoon", "family"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    nights: 4,
    days: 5,
    price: 75990,
    oldPrice: 84990,
    rating: 4.9,
    reviews: 203,
    badge: "Island Favourite",
    departure: "Every Thursday",
    groupSize: "12–22 guests",
    summary:
      "Five easy days of turquoise water, white sand and coral reefs. Snorkel at Elephant Beach, wander Radhanagar at sunset and slow down completely.",
    highlights: [
      "Sunset at Radhanagar Beach",
      "Snorkelling at Elephant Beach",
      "Cellular Jail light and sound show",
      "Kalapathar Beach drive",
      "Private ferry between islands",
    ],
    inclusions: indiaInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Port Blair",
        description:
          "Arrive in Port Blair, check in and visit Corbyn's Cove. Evening light and sound show at Cellular Jail.",
      },
      {
        day: 2,
        title: "Port Blair to Swaraj Dweep",
        description:
          "Ferry to Swaraj Dweep (Havelock), settle in and spend the afternoon at Radhanagar Beach for sunset.",
      },
      {
        day: 3,
        title: "Elephant Beach · Snorkelling",
        description:
          "Boat ride to Elephant Beach for snorkelling and optional sea walking, with the rest of the day free by the sea.",
      },
      {
        day: 4,
        title: "Kalapathar · Port Blair",
        description:
          "A quiet morning at Kalapathar Beach before the ferry back to Port Blair. Evening at the Aberdeen Bazaar.",
      },
      {
        day: 5,
        title: "Depart Port Blair",
        description:
          "Visit the Samudrika Marine Museum before your transfer to the airport.",
      },
    ],
  },
  {
    slug: "best-of-europe",
    title: "Best of Europe",
    destinationSlug: "europe",
    destinationName: "Europe",
    region: "International",
    experiences: ["family", "luxury"],
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
    nights: 11,
    days: 12,
    price: 375790,
    oldPrice: 399990,
    rating: 4.8,
    reviews: 172,
    badge: "Best Seller",
    departure: "18 Apr · 16 May · 12 Sep",
    groupSize: "20–34 guests",
    summary:
      "Paris, Switzerland, Italy and the Low Countries in one grand journey. Iconic sights by day, thoughtful local experiences by evening, and every detail handled.",
    highlights: [
      "Eiffel Tower and Seine river cruise",
      "Jungfrau railway to the Top of Europe",
      "Venice gondola and St Mark's Square",
      "Colosseum and Vatican guided tour",
      "Amsterdam canal cruise and tulip fields",
    ],
    inclusions: worldInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Paris",
        description:
          "Arrive in Paris and transfer to your hotel. Evening Seine river cruise with views of the illuminated city.",
      },
      {
        day: 2,
        title: "Paris · City of Light",
        description:
          "Guided tour of the Eiffel Tower, Arc de Triomphe and Champs-Élysées, with an afternoon at the Louvre.",
      },
      {
        day: 3,
        title: "Paris to Switzerland",
        description:
          "High-speed train to Lucerne. Evening walk across the Chapel Bridge and through the old town.",
      },
      {
        day: 4,
        title: "Mount Titlis",
        description:
          "Rotair cable car to Mount Titlis for glacier views, then a scenic drive to Interlaken.",
      },
      {
        day: 5,
        title: "Jungfraujoch",
        description:
          "Cogwheel train to the Top of Europe, with time in Lauterbrunnen and Grindelwald on the way back.",
      },
      {
        day: 6,
        title: "Switzerland to Italy",
        description:
          "Drive through the Alps to Venice, stopping at Lake Como. Evening at leisure in the floating city.",
      },
      {
        day: 7,
        title: "Venice · Islands",
        description:
          "St Mark's Basilica, Doge's Palace and a gondola ride, followed by a boat trip to Murano and Burano.",
      },
      {
        day: 8,
        title: "Venice to Florence",
        description:
          "Travel to Florence for a guided walk through the Duomo, Ponte Vecchio and Uffizi Gallery.",
      },
      {
        day: 9,
        title: "Florence to Rome",
        description:
          "Drive to Rome via the Tuscan countryside. Afternoon at the Trevi Fountain and Spanish Steps.",
      },
      {
        day: 10,
        title: "Rome · Ancient City",
        description:
          "Colosseum, Roman Forum and Vatican Museums with a local guide. Farewell dinner in Trastevere.",
      },
      {
        day: 11,
        title: "Rome to Amsterdam",
        description:
          "Flight to Amsterdam. Canal cruise through the city's UNESCO-listed ring and an evening in Dam Square.",
      },
      {
        day: 12,
        title: "Depart Amsterdam",
        description:
          "Visit the Keukenhof gardens in season, then transfer to the airport for your flight home.",
      },
    ],
  },
  {
    slug: "swiss-paris-amsterdam",
    title: "Swiss Paris & Amsterdam",
    destinationSlug: "europe",
    destinationName: "Europe",
    region: "International",
    experiences: ["honeymoon", "luxury"],
    image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0",
    nights: 7,
    days: 8,
    price: 247690,
    rating: 4.8,
    reviews: 144,
    departure: "09 May · 20 Jun · 05 Sep",
    groupSize: "18–28 guests",
    summary:
      "A shorter Europe that still feels grand: alpine trains, Parisian evenings and Amsterdam's canals. Ideal for couples and first-time visitors.",
    highlights: [
      "Jungfraujoch cogwheel train",
      "Paris city tour and Seine cruise",
      "Lucerne lake promenade",
      "Amsterdam canal cruise",
      "Swiss chocolate and cheese tasting",
    ],
    inclusions: worldInclusions,
    exclusions: standardExclusions,
    itinerary: [
      {
        day: 1,
        title: "Arrive Zurich · Lucerne",
        description:
          "Arrive in Zurich and transfer to Lucerne for a lakeside evening and welcome dinner.",
      },
      {
        day: 2,
        title: "Mount Titlis",
        description:
          "Ride the Rotair to Mount Titlis, then return to Lucerne for a walking tour of the old town.",
      },
      {
        day: 3,
        title: "Jungfraujoch",
        description:
          "Full-day excursion by cogwheel train to Jungfraujoch, with a stop in Interlaken.",
      },
      {
        day: 4,
        title: "Lucerne to Paris",
        description:
          "Train to Paris. Evening Seine river cruise and dinner near the Latin Quarter.",
      },
      {
        day: 5,
        title: "Paris · Icons",
        description:
          "Eiffel Tower, Arc de Triomphe and a guided walk through Montmartre, with free time for shopping.",
      },
      {
        day: 6,
        title: "Paris to Amsterdam",
        description:
          "High-speed train to Amsterdam. Afternoon canal cruise and a walk through the Jordaan district.",
      },
      {
        day: 7,
        title: "Amsterdam · Countryside",
        description:
          "Day trip to Zaanse Schans windmills and Volendam fishing village, with a cheese and stroopwafel tasting.",
      },
      {
        day: 8,
        title: "Depart Amsterdam",
        description:
          "Transfer to Schiphol airport for your flight home.",
      },
    ],
  },
  {
    slug: "dubai-abu-dhabi",
    title: "Dubai with Abu Dhabi",
    destinationSlug: "dubai",
    destinationName: "Dubai",
    region: "International",
    experiences: ["family"],
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    nights: 4,
    days: 5,
    price: 133740,
    rating: 4.7,
    reviews: 198,
    departure: "Every Friday",
    groupSize: "16–28 guests",
    summary:
      "Big-city thrills, desert dunes and two theme parks. A short, easy holiday that keeps every generation happy, from grandparents to teenagers.",
    highlights: [
      "Burj Khalifa observation deck",
      "Desert safari with BBQ dinner",
      "Sheikh Zayed Grand Mosque",
      "Dubai Frame and Marina cruise",
      "Two theme parks of your choice",
    ],
    inclusions: worldInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Dubai",
        description:
          "Arrive in Dubai, transfer to your hotel and spend the evening at the Dubai Marina promenade.",
      },
      {
        day: 2,
        title: "Dubai City · Burj Khalifa",
        description:
          "Visit the Burj Khalifa, Dubai Mall and Dubai Frame, with an evening dhow cruise along the creek.",
      },
      {
        day: 3,
        title: "Desert Safari",
        description:
          "Morning at leisure, then an afternoon dune-bashing safari with camel rides, henna and a BBQ dinner under the stars.",
      },
      {
        day: 4,
        title: "Abu Dhabi Day Trip",
        description:
          "Drive to Abu Dhabi for the Sheikh Zayed Grand Mosque, Emirates Palace and optional Ferrari World.",
      },
      {
        day: 5,
        title: "Depart Dubai",
        description:
          "Last-minute shopping at the Gold and Spice Souks before your airport transfer.",
      },
    ],
  },
  {
    slug: "bali-bliss-honeymoon",
    title: "Bali Bliss Honeymoon",
    destinationSlug: "bali",
    destinationName: "Bali",
    region: "International",
    experiences: ["honeymoon", "luxury"],
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    nights: 5,
    days: 6,
    price: 89990,
    oldPrice: 98990,
    rating: 4.9,
    reviews: 156,
    badge: "New",
    departure: "Every Monday",
    groupSize: "Private · 2 guests",
    summary:
      "A private honeymoon with a pool villa in Ubud, a beachfront resort in Seminyak and a day on the water to Nusa Penida. Romance, without the planning.",
    highlights: [
      "Private pool villa in Ubud",
      "Nusa Penida speedboat day",
      "Floating breakfast and flower bath",
      "Tanah Lot sunset temple",
      "Couples spa evening in Seminyak",
    ],
    inclusions: worldInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Bali · Ubud",
        description:
          "Arrive in Denpasar and transfer to your private pool villa in Ubud. Evening at leisure with a welcome dinner.",
      },
      {
        day: 2,
        title: "Ubud · Rice Terraces",
        description:
          "Visit the Tegallalang rice terraces, Sacred Monkey Forest and a coffee plantation, with a floating breakfast at the villa.",
      },
      {
        day: 3,
        title: "Nusa Penida Day Trip",
        description:
          "Speedboat to Nusa Penida for Kelingking Beach and Angel's Billabong, returning to Ubud for a couples spa evening.",
      },
      {
        day: 4,
        title: "Ubud to Seminyak",
        description:
          "Drive to Seminyak via Tanah Lot temple. Check into your beachfront resort and enjoy sunset at the beach club.",
      },
      {
        day: 5,
        title: "Seminyak · Free Day",
        description:
          "A day to yourselves: surf lessons, shopping or simply the pool. Farewell seafood dinner by the sea.",
      },
      {
        day: 6,
        title: "Depart Bali",
        description:
          "Private transfer to the airport for your flight home.",
      },
    ],
  },
  {
    slug: "japan-cherry-blossom",
    title: "Japan Cherry Blossom",
    destinationSlug: "japan",
    destinationName: "Japan",
    region: "International",
    experiences: ["luxury", "family"],
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    nights: 7,
    days: 8,
    price: 229990,
    rating: 4.9,
    reviews: 87,
    badge: "New",
    departure: "28 Mar · 04 Apr 2027",
    groupSize: "14–22 guests",
    summary:
      "Sakura season in Tokyo, Kyoto and Osaka. Bullet trains, temple gardens, Michelin-listed ramen and a night in a traditional ryokan.",
    highlights: [
      "Shinkansen between Tokyo and Kyoto",
      "Cherry blossoms at Ueno and Maruyama Park",
      "Fushimi Inari and Kinkaku-ji",
      "Mount Fuji day trip to Hakone",
      "Kaiseki dinner in a ryokan",
    ],
    inclusions: worldInclusions,
    exclusions: standardExclusions,
    featured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrive Tokyo",
        description:
          "Arrive in Tokyo and transfer to your hotel. Evening walk through Shinjuku and an izakaya welcome dinner.",
      },
      {
        day: 2,
        title: "Tokyo · Blossoms & Neighbourhoods",
        description:
          "Visit Ueno Park, Senso-ji temple and Meiji Shrine, with an afternoon in Harajuku and Shibuya.",
      },
      {
        day: 3,
        title: "Hakone · Mount Fuji",
        description:
          "Day trip to Hakone for Mount Fuji views, a lake cruise and a ride on the ropeway. Return to Tokyo.",
      },
      {
        day: 4,
        title: "Tokyo to Kyoto",
        description:
          "Shinkansen to Kyoto. Afternoon at Fushimi Inari and a walk through Gion's lantern-lit lanes.",
      },
      {
        day: 5,
        title: "Kyoto · Temples",
        description:
          "Visit Kinkaku-ji, Arashiyama bamboo grove and Maruyama Park, followed by a tea ceremony.",
      },
      {
        day: 6,
        title: "Kyoto to Osaka",
        description:
          "Travel to Osaka and explore Dotonbori's food streets and Osaka Castle. Evening street-food crawl.",
      },
      {
        day: 7,
        title: "Nara Day Trip",
        description:
          "Day trip to Nara for Todai-ji temple and the deer park, returning for a farewell kaiseki dinner.",
      },
      {
        day: 8,
        title: "Depart Osaka",
        description:
          "Transfer to Kansai International Airport for your flight home.",
      },
    ],
  },
  {
    slug: "maldives-overwater-escape",
    title: "Maldives Overwater Escape",
    destinationSlug: "maldives",
    destinationName: "Maldives",
    region: "International",
    experiences: ["honeymoon", "luxury"],
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
    nights: 4,
    days: 5,
    price: 149990,
    oldPrice: 169990,
    rating: 4.9,
    reviews: 134,
    departure: "Daily departures",
    groupSize: "Private · 2 guests",
    summary:
      "An overwater villa, a house reef at your doorstep and nothing on the agenda. The most effortless luxury escape we offer.",
    highlights: [
      "Overwater villa with private deck",
      "House-reef snorkelling",
      "Sunset dolphin cruise",
      "Private sandbank picnic",
      "Couples spa treatment",
    ],
    inclusions: worldInclusions,
    exclusions: standardExclusions,
    itinerary: [
      {
        day: 1,
        title: "Arrive Malé · Resort",
        description:
          "Arrive in Malé and take a speedboat to your resort. Settle into your overwater villa with a sunset dinner.",
      },
      {
        day: 2,
        title: "House Reef · Spa",
        description:
          "Morning snorkelling on the house reef and an afternoon couples spa treatment over the lagoon.",
      },
      {
        day: 3,
        title: "Sandbank Picnic",
        description:
          "Private boat trip to a secluded sandbank for a picnic lunch, with the evening free at the resort.",
      },
      {
        day: 4,
        title: "Dolphins · Sunset",
        description:
          "A slow morning, an optional dive and a sunset dolphin cruise to close the day.",
      },
      {
        day: 5,
        title: "Depart Malé",
        description:
          "Speedboat back to Malé for your international flight home.",
      },
    ],
  },
  {
    slug: "northern-lights-iceland",
    title: "Northern Lights & Iceland",
    destinationSlug: "europe",
    destinationName: "Europe",
    region: "International",
    experiences: ["adventure", "luxury"],
    image: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73",
    nights: 6,
    days: 7,
    price: 279990,
    rating: 4.9,
    reviews: 64,
    badge: "New",
    departure: "12 Feb · 05 Mar 2027",
    groupSize: "12–18 guests",
    summary:
      "Chase the aurora across Iceland's black-sand beaches, glacier lagoons and geothermal valleys. Small groups, expert guides, once-in-a-lifetime skies.",
    highlights: [
      "Northern Lights hunting with an expert guide",
      "Jökulsárlón glacier lagoon",
      "Golden Circle and Geysir",
      "Blue Lagoon geothermal spa",
      "Black-sand Reynisfjara beach",
    ],
    inclusions: worldInclusions,
    exclusions: standardExclusions,
    itinerary: [
      {
        day: 1,
        title: "Arrive Reykjavik",
        description:
          "Arrive in Reykjavik and settle in. Evening aurora forecast briefing and a first night hunt if conditions allow.",
      },
      {
        day: 2,
        title: "Golden Circle",
        description:
          "Visit Thingvellir National Park, Geysir and Gullfoss, returning to Reykjavik for a rooftop dinner.",
      },
      {
        day: 3,
        title: "South Coast",
        description:
          "Drive along the south coast to Seljalandsfoss, Skógafoss and Reynisfjara's black-sand beach.",
      },
      {
        day: 4,
        title: "Glacier Lagoon",
        description:
          "Explore Jökulsárlón glacier lagoon and Diamond Beach, with an optional ice-cave tour.",
      },
      {
        day: 5,
        title: "Blue Lagoon · Aurora",
        description:
          "A relaxing morning at the Blue Lagoon, then a dedicated northern-lights hunt after dark.",
      },
      {
        day: 6,
        title: "Reykjavik · Free Day",
        description:
          "A free day for the National Museum, harbour walks and cafés. Farewell dinner in the old town.",
      },
      {
        day: 7,
        title: "Depart Reykjavik",
        description:
          "Transfer to Keflavik airport for your flight home.",
      },
    ],
  },
  {
    slug: "keralam-womens-special",
    title: "Keralam Women's Special",
    destinationSlug: "kerala",
    destinationName: "Kerala",
    region: "India",
    experiences: ["women", "spiritual", "family"],
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
    nights: 7,
    days: 8,
    price: 63990,
    oldPrice: 68990,
    rating: 4.8,
    reviews: 176,
    badge: "Women's Special",
    departure: "08 Mar · 12 Apr",
    groupSize: "14–20 women",
    summary:
      "A women-only journey through Kerala with a women tour leader, safe handpicked stays and a group that becomes friends by the second day.",
    highlights: [
      "Women-led guided group",
      "Alleppey houseboat stay",
      "Munnar tea estate walk",
      "Ayurvedic massage session",
      "Kanyakumari sunrise excursion",
    ],
    inclusions: indiaInclusions,
    exclusions: standardExclusions,
    itinerary: [
      {
        day: 1,
        title: "Arrive Kochi",
        description:
          "Arrive in Kochi and meet your women tour leader and group. Evening walk through Fort Kochi.",
      },
      {
        day: 2,
        title: "Kochi to Munnar",
        description:
          "Drive to Munnar with waterfall stops, arriving for a tea estate walk and a quiet evening.",
      },
      {
        day: 3,
        title: "Munnar · Tea Country",
        description:
          "Explore Mattupetty and Eravikulam National Park, with an afternoon at leisure and an Ayurvedic massage.",
      },
      {
        day: 4,
        title: "Munnar to Thekkady",
        description:
          "Spice plantation tour and a Periyar boat safari, followed by a cooking demonstration.",
      },
      {
        day: 5,
        title: "Thekkady to Alleppey",
        description:
          "Board a private houseboat for an overnight backwater cruise with fresh Kerala meals.",
      },
      {
        day: 6,
        title: "Alleppey to Kovalam",
        description:
          "Drive to Kovalam for a relaxed afternoon on the beach and a group dinner by the sea.",
      },
      {
        day: 7,
        title: "Kanyakumari Sunrise",
        description:
          "Early start for sunrise at Kanyakumari, returning to Kovalam for a farewell spa session.",
      },
      {
        day: 8,
        title: "Depart Trivandrum",
        description:
          "Transfer to Trivandrum airport for your flight home.",
      },
    ],
  },
  {
    slug: "sri-lanka-ramayana-trail",
    title: "Sri Lanka Ramayana Trail",
    destinationSlug: "sri-lanka",
    destinationName: "Sri Lanka",
    region: "International",
    experiences: ["spiritual", "family"],
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
    nights: 6,
    days: 7,
    price: 119190,
    rating: 4.8,
    reviews: 92,
    departure: "16 Jan · 13 Feb · 13 Mar",
    groupSize: "18–28 guests",
    summary:
      "A meaningful yatra through the Ramayana sites of Sri Lanka, with comfortable stays, a knowledgeable guide and gentle pacing for elders.",
    highlights: [
      "Munneswaram and Manavari temples",
      "Sigiriya rock fortress",
      "Kandy's Temple of the Tooth",
      "Ella scenic train ride",
      "Galle Fort walk",
    ],
    inclusions: worldInclusions,
    exclusions: standardExclusions,
    itinerary: [
      {
        day: 1,
        title: "Arrive Colombo",
        description:
          "Arrive in Colombo and transfer to Chilaw. Evening darshan at Munneswaram Temple.",
      },
      {
        day: 2,
        title: "Chilaw to Sigiriya",
        description:
          "Visit Manavari Temple, then travel to Sigiriya for an afternoon at leisure.",
      },
      {
        day: 3,
        title: "Sigiriya · Dambulla",
        description:
          "Climb Sigiriya rock fortress in the morning and explore the Dambulla cave temples in the afternoon.",
      },
      {
        day: 4,
        title: "Sigiriya to Kandy",
        description:
          "Drive to Kandy via a spice garden, visiting the Temple of the Tooth and enjoying a cultural dance show.",
      },
      {
        day: 5,
        title: "Kandy to Ella",
        description:
          "Scenic train ride through tea country to Ella, with a walk to the Nine Arch Bridge.",
      },
      {
        day: 6,
        title: "Ella to Galle",
        description:
          "Travel south to Galle for a walk through the Dutch fort and a farewell dinner by the sea.",
      },
      {
        day: 7,
        title: "Depart Colombo",
        description:
          "Transfer to Colombo airport for your flight home, with a stop at a tea shop en route.",
      },
    ],
  },
];

export const featuredTours = tours.filter((tour) => tour.featured);

export function getTour(slug: string) {
  return tours.find((tour) => tour.slug === slug);
}

export function getToursByDestination(destinationSlug: string) {
  return tours.filter((tour) => tour.destinationSlug === destinationSlug);
}

export function getRelatedTours(tour: Tour, count = 3) {
  return tours
    .filter(
      (candidate) =>
        candidate.slug !== tour.slug &&
        (candidate.destinationSlug === tour.destinationSlug ||
          candidate.region === tour.region),
    )
    .slice(0, count);
}
