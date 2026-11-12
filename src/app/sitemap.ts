import type { MetadataRoute } from "next";
import { loadDestinations, loadExperiences, loadTours } from "@/lib/content";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, destinations, experiences] = await Promise.all([
    loadTours(),
    loadDestinations(),
    loadExperiences(),
  ]);

  const staticPages = [
    "",
    "/tours",
    "/speciality-tours",
    "/personalised",
    "/corporate",
    "/destinations",
    "/experiences",
    "/testimonials",
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

  const specialityPages = experiences.map((experience) => ({
    url: `${site.url}/speciality-tours/${experience.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...tourPages,
    ...destinationPages,
    ...specialityPages,
  ];
}
