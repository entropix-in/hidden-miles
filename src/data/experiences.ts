export type Experience = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  image: string;
  icon: "heart" | "sparkles" | "mountain" | "users" | "crown" | "flower";
  highlights: string[];
};

export const experiences: Experience[] = [
  {
    slug: "honeymoon",
    title: "Honeymoons & Celebrations",
    shortTitle: "Honeymoon",
    description:
      "Private villas, candlelit dinners and just enough adventure. We design the first chapter of your life together, down to the last detail.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
    icon: "heart",
    highlights: ["Private transfers", "Romantic stays", "Curated experiences", "Flexible pacing"],
  },
  {
    slug: "spiritual",
    title: "Spiritual Journeys",
    shortTitle: "Spiritual",
    description:
      "Temple towns, riverside aartis and guided yatras planned with care for elders and families. Travel that leaves you a little lighter.",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
    icon: "flower",
    highlights: ["Temple darshan", "Comfortable stays", "Local guides", "Elder-friendly pace"],
  },
  {
    slug: "adventure",
    title: "Himalayan Adventures",
    shortTitle: "Adventure",
    description:
      "High passes, frozen lakes and trails that reward the brave. Small groups, experienced leaders and safety at the centre of every day.",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2",
    icon: "mountain",
    highlights: ["Small groups", "Acclimatisation days", "Certified leaders", "All gear included"],
  },
  {
    slug: "family",
    title: "Family Holidays",
    shortTitle: "Family",
    description:
      "Itineraries that work for grandparents, parents and kids at once. Easy pacing, connecting rooms and memories everyone gets to keep.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    icon: "users",
    highlights: ["Kid-friendly stays", "Slow pacing", "Family dining", "On-trip support"],
  },
  {
    slug: "luxury",
    title: "Luxury Escapes",
    shortTitle: "Luxury",
    description:
      "Five-star stays, private guides and the kind of service that anticipates you. Our most considered journeys for the most special occasions.",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077",
    icon: "crown",
    highlights: ["Five-star stays", "Private guides", "Fine dining", "Door-to-door planning"],
  },
  {
    slug: "women",
    title: "Women's Special",
    shortTitle: "Women's Special",
    description:
      "Journeys designed by women, for women. Safe, welcoming groups where friendships form over shared sunsets, stories and shopping finds.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
    icon: "sparkles",
    highlights: ["Women tour leaders", "Safe stays", "Small groups", "Solo-traveller friendly"],
  },
];

export function getExperience(slug: string) {
  return experiences.find((experience) => experience.slug === slug);
}
