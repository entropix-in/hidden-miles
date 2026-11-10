import type { MetadataRoute } from "next";
import { destinations } from "@/data/destinations";
import { tours } from "@/data/tours";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/tours",
    "/destinations",
    "/experiences",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const tourPages = tours.map((tour) => ({
    url: `${site.url}/tours/${tour.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const destinationPages = destinations.map((destination) => ({
    url: `${site.url}/destinations/${destination.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...tourPages, ...destinationPages];
}
