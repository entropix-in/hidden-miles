export type Destination = {
  slug: string;
  name: string;
  region: "India" | "International";
  tagline: string;
  description: string;
  image: string;
  bestTime: string;
  highlights: string[];
};

export const destinations: Destination[] = [
  {
    slug: "kashmir",
    name: "Kashmir",
    region: "India",
    tagline: "Shikaras, snow and saffron valleys",
    description:
      "Dal Lake at dawn, the meadows of Gulmarg and a cup of kahwa by a crackling fire. Kashmir is poetry in every season, and our houseboat stays make it personal.",
    image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b",
    bestTime: "March to October · December for snow",
    highlights: ["Dal Lake houseboat", "Gulmarg gondola", "Pahalgam valleys", "Mughal gardens"],
  },
  {
    slug: "kerala",
    name: "Kerala",
    region: "India",
    tagline: "Backwaters, tea hills and quiet mornings",
    description:
      "Drift through palm-lined backwaters, wake up in a Munnar tea estate and watch the sun set over the Arabian Sea. Slow, green and deeply restorative.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
    bestTime: "September to March",
    highlights: ["Alleppey houseboat", "Munnar tea gardens", "Thekkady spice trails", "Kovalam beaches"],
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    region: "India",
    tagline: "Forts, palaces and desert sunsets",
    description:
      "Jaipur's pink lanes, Udaipur's shimmering lakes and the golden dunes of Jaisalmer. A land of royal stories, craft bazaars and unforgettable hospitality.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245",
    bestTime: "October to March",
    highlights: ["Amber Fort", "Udaipur lake palace", "Jaisalmer dunes", "Ranthambore safari"],
  },
  {
    slug: "ladakh",
    name: "Ladakh",
    region: "India",
    tagline: "High passes and otherworldly silence",
    description:
      "Turquoise lakes, prayer flags in the wind and monasteries perched on impossible cliffs. Ladakh is for travellers who like their beauty a little wild.",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2",
    bestTime: "May to September · February for snow",
    highlights: ["Pangong Lake", "Nubra Valley", "Hemis Monastery", "Khardung La"],
  },
  {
    slug: "himachal",
    name: "Himachal",
    region: "India",
    tagline: "Pine forests and Himalayan air",
    description:
      "Colonial Shimla, the cafés of Manali and hidden trails around Kasuali. Perfect for families, first-time mountain travellers and slow summer escapes.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23",
    bestTime: "March to June · December for snow",
    highlights: ["Shimla toy train", "Solang Valley", "Manu Temple", "Kasuali trails"],
  },
  {
    slug: "north-east",
    name: "North East",
    region: "India",
    tagline: "Living root bridges and rolling tea hills",
    description:
      "Meghalaya's waterfalls, Assam's tea estates and the warm welcome of the hills. A quieter India that rewards the curious traveller.",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
    bestTime: "October to April",
    highlights: ["Living root bridges", "Kaziranga safari", "Shillong peaks", "Brahmaputra cruise"],
  },
  {
    slug: "andaman",
    name: "Andaman",
    region: "India",
    tagline: "Blue water and barefoot days",
    description:
      "Powder-white beaches, coral gardens and island drives with the windows down. Honeymooners and families both fall for these islands.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    bestTime: "October to May",
    highlights: ["Radhanagar Beach", "Scuba at Havelock", "Ross Island", "Neil Island"],
  },
  {
    slug: "europe",
    name: "Europe",
    region: "International",
    tagline: "Grand cities and alpine dreams",
    description:
      "Paris at twilight, Swiss trains through green valleys and the canals of Amsterdam. Our Europe journeys blend icons with hidden local moments.",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
    bestTime: "April to October",
    highlights: ["Eiffel Tower", "Jungfrau railway", "Amsterdam canals", "Venice gondolas"],
  },
  {
    slug: "dubai",
    name: "Dubai",
    region: "International",
    tagline: "Desert gold and skyline sparkle",
    description:
      "Morning desert safaris, record-breaking towers and family theme parks. Dubai packs big experiences into a short, easy escape.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    bestTime: "November to March",
    highlights: ["Burj Khalifa", "Desert safari", "Dubai Marina", "Abu Dhabi Grand Mosque"],
  },
  {
    slug: "bali",
    name: "Bali",
    region: "International",
    tagline: "Rice terraces and island rituals",
    description:
      "Temples in the mist, beach clubs at sunset and villas with private pools. Bali is the rare island that works for honeymoons and family time alike.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    bestTime: "April to October",
    highlights: ["Ubud rice terraces", "Tanah Lot", "Nusa Penida", "Seminyak sunsets"],
  },
  {
    slug: "japan",
    name: "Japan",
    region: "International",
    tagline: "Cherry blossoms and quiet precision",
    description:
      "Bullet trains, temple gardens, neon streets and the most thoughtful hospitality on earth. Japan is a lesson in travelling beautifully.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    bestTime: "March to May · October to November",
    highlights: ["Mount Fuji", "Kyoto temples", "Tokyo nightlife", "Osaka food streets"],
  },
  {
    slug: "maldives",
    name: "Maldives",
    region: "International",
    tagline: "Overwater villas and endless blue",
    description:
      "Wake up above the lagoon, snorkel from your deck and watch the horizon change colour. The easiest way to do absolutely nothing, beautifully.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
    bestTime: "November to April",
    highlights: ["Overwater villas", "Coral snorkelling", "Sunset dhonis", "Private sandbanks"],
  },
  {
    slug: "sri-lanka",
    name: "Sri Lanka",
    region: "International",
    tagline: "Tea country and temple trails",
    description:
      "Misty hill railways, ancient cities and beaches on the doorstep. Sri Lanka is compact, warm and rich with stories.",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
    bestTime: "December to April",
    highlights: ["Ella train ride", "Sigiriya rock", "Kandy temple", "Galle fort"],
  },
];

export function getDestination(slug: string) {
  return destinations.find((destination) => destination.slug === slug);
}
