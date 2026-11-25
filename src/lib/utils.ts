export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const fallbackImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

/**
 * Sized Unsplash URL. Pass `height` (and a higher `quality`) when the slot's
 * shape differs from the photo's, so the crop arrives at full resolution
 * instead of being stretched by `object-cover`.
 */
export function imageUrl(
  src?: string | null,
  width = 1200,
  { height, quality = 78 }: { height?: number; quality?: number } = {},
) {
  const source = src?.trim() || fallbackImage;

  try {
    const url = new URL(source);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    if (height) url.searchParams.set("h", String(height));
    url.searchParams.set("q", String(quality));
    return url.toString();
  } catch {
    return source;
  }
}
