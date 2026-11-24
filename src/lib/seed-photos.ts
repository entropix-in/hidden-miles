import { copyFile, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { mediaDir, photoExists, storePhoto } from "@/lib/media";
import { photoLimit } from "@/lib/media-path";

const remotePattern = /^https:\/\/images\.unsplash\.com\//;
const localPattern = /^\/api\/media\/([a-f0-9]{64})$/;
/** Photos uploaded in the admin for curated seed content, committed to the repo. */
const bundledDir = path.join(process.cwd(), "src", "data", "seed-media");

async function download(source: string) {
  const url = new URL(source);
  // Bound the source dimensions before decoding high-resolution originals.
  url.searchParams.set("w", "2400");
  url.searchParams.set("h", "2400");
  url.searchParams.set("fit", "max");
  url.searchParams.delete("auto");
  url.searchParams.set("fm", "jpg");
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (!response.ok || !response.body) throw new Error(`Download returned ${response.status}.`);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
    size += chunk.byteLength;
    if (size > photoLimit) throw new Error("Download exceeds 8 MB.");
    chunks.push(chunk);
  }
  return storePhoto(Buffer.concat(chunks));
}

function collect(value: unknown, found: Set<string>) {
  if (typeof value === "string") {
    if (remotePattern.test(value) || localPattern.test(value)) found.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collect(item, found));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collect(item, found));
  }
}

function rewrite(value: unknown, map: Map<string, string>) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "string" && map.has(item)) value[index] = map.get(item)!;
      else rewrite(item, map);
    });
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const [key, item] of Object.entries(record)) {
      if (typeof item === "string" && map.has(item)) record[key] = map.get(item)!;
      else rewrite(item, map);
    }
  }
}

/**
 * Copies bundled photos from src/data/seed-media and downloads every remote starter photo referenced by the seed data into the
 * media directory and rewrites the data in place to local `/api/media/<id>` paths.
 * A manifest in the media directory skips photos fetched on earlier runs.
 */
export async function localiseSeedPhotos(...sources: unknown[]) {
  const urls = new Set<string>();
  sources.forEach((source) => collect(source, urls));

  const manifestFile = path.join(mediaDir(), "seed-manifest.json");
  let manifest: Record<string, string> = {};
  try {
    manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  } catch {
    // First run.
  }

  const map = new Map<string, string>();
  let downloaded = 0;
  let failed = 0;
  let bundled = 0;
  for (const url of urls) {
    const local = localPattern.exec(url)?.[1];
    if (local) {
      try {
        await mkdir(mediaDir(), { recursive: true });
        await copyFile(path.join(bundledDir, `${local}.webp`), path.join(mediaDir(), `${local}.webp`));
        bundled += 1;
      } catch {
        failed += 1;
        console.warn(`Bundled photo ${local}.webp is missing from ${bundledDir}.`);
      }
      continue;
    }
    const cached = manifest[url];
    if (cached && (await photoExists(cached.split("/").at(-1)!))) {
      map.set(url, cached);
      continue;
    }
    try {
      const local = await download(url);
      manifest[url] = local;
      map.set(url, local);
      downloaded += 1;
    } catch (error) {
      failed += 1;
      console.warn(`Could not download ${url}: ${error instanceof Error ? error.message : error}`);
    }
  }

  await mkdir(mediaDir(), { recursive: true });
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  sources.forEach((source) => rewrite(source, map));
  return { total: urls.size, bundled, downloaded, cached: map.size - downloaded, failed };
}
