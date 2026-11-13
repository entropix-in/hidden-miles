export const destinationCoordinates: Record<string, string> = {
  kashmir: "34.08° N  74.79° E",
  kerala: "9.49° N  76.33° E",
  rajasthan: "26.91° N  75.79° E",
  ladakh: "34.15° N  77.58° E",
  himachal: "31.10° N  77.17° E",
  "north-east": "25.57° N  91.88° E",
  andaman: "11.74° N  92.66° E",
  europe: "46.82° N  8.23° E",
  dubai: "25.20° N  55.27° E",
  bali: "8.51° S  115.26° E",
  japan: "35.01° N  135.77° E",
  maldives: "3.20° N  73.22° E",
  "sri-lanka": "7.87° N  80.77° E",
  thailand: "8.09° N  98.90° E",
};

export function coordsFor(slug: string) {
  return destinationCoordinates[slug] ?? "20.59° N  78.96° E";
}
