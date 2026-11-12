import type {
  ItineraryBadge,
  ItineraryBadgeKind,
  ItineraryDay,
} from "@/data/tours";

type BadgeRule = ItineraryBadge & {
  pattern: RegExp;
};

const badgeRules: BadgeRule[] = [
  { pattern: /breakfast/i, label: "Breakfast", kind: "meal" },
  { pattern: /lunch|sadya/i, label: "Lunch", kind: "meal" },
  { pattern: /dinner|wazwan|seafood/i, label: "Dinner", kind: "meal" },
  {
    pattern: /meals? (?:included|cooked|on board)|on board/i,
    label: "Meals included",
    kind: "meal",
  },
  {
    pattern: /tea (?:estate|tasting|garden)/i,
    label: "Tea tasting",
    kind: "meal",
  },
  { pattern: /houseboat/i, label: "Houseboat stay", kind: "stay" },
  {
    pattern: /hotel|resort|homestay|heritage stay|overnight/i,
    label: "Overnight stay",
    kind: "stay",
  },
  {
    pattern: /transfer|airport|flight|train|coach|inter-city/i,
    label: "Transfer",
    kind: "travel",
  },
  { pattern: /gondola|cable car/i, label: "Gondola ride", kind: "experience" },
  { pattern: /shikara/i, label: "Shikara ride", kind: "experience" },
  {
    pattern: /cruise|boat ride|boat safari/i,
    label: "Boat ride",
    kind: "experience",
  },
  {
    pattern: /safari|wildlife/i,
    label: "Wildlife safari",
    kind: "experience",
  },
  { pattern: /walk|trek|hike/i, label: "Guided walk", kind: "experience" },
  {
    pattern: /workshop|performance|temple|monastery|museum|fort|palace/i,
    label: "Culture & sights",
    kind: "experience",
  },
  {
    pattern: /leisure|free time|at your own pace|relaxed/i,
    label: "Free time",
    kind: "leisure",
  },
];

export function deriveItineraryBadges(day: ItineraryDay): ItineraryBadge[] {
  const text = `${day.title} ${day.description}`;
  const badges: ItineraryBadge[] = [];

  for (const rule of badgeRules) {
    if (!rule.pattern.test(text)) continue;
    if (badges.some((badge) => badge.label === rule.label)) continue;
    // A houseboat already covers the stay badge for that day.
    if (
      rule.label === "Overnight stay" &&
      badges.some((badge) => badge.label === "Houseboat stay")
    ) {
      continue;
    }
    badges.push({ label: rule.label, kind: rule.kind });
    if (badges.length === 4) break;
  }

  if (!badges.length) {
    badges.push({ label: "Sightseeing", kind: "experience" });
  }

  return badges;
}

/**
 * Badges set in the admin panel win. Tours without custom badges fall back to
 * keywords found in the day title and description.
 */
export function getItineraryBadges(day: ItineraryDay): ItineraryBadge[] {
  return day.badges?.length ? day.badges : deriveItineraryBadges(day);
}

export const itineraryBadgeKindLabels: Record<ItineraryBadgeKind, string> = {
  meal: "Food & drinks",
  stay: "Stay",
  travel: "Travel",
  experience: "Experience",
  leisure: "Leisure",
};
