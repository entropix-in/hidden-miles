import { createHash, randomUUID } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { legacyPhotos } from "@/db/schema";
import { photoLimit } from "@/lib/media-path";

const idPattern = /^[a-f0-9]{64}$/;

/** Directory holding uploaded photos as `<sha256>.webp`. Mount a volume here in production. */
export function mediaDir() {
  return path.resolve(process.env.MEDIA_DIR?.trim() || path.join(process.cwd(), "storage", "media"));
}

function photoFile(id: string) {
  if (!idPattern.test(id)) throw new Error("Invalid photo id.");
  return path.join(mediaDir(), `${id}.webp`);
}

async function writePhotoFile(id: string, data: Buffer) {
  const file = photoFile(id);
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${randomUUID()}.tmp`;
  await writeFile(temp, data);
  await rename(temp, file);
}

/**
 * Moves a photo stored by an older release in the `photos` table onto disk.
 * Lets existing deployments switch over without a separate export step.
 */
async function migrateLegacyPhoto(id: string) {
  const db = getDb();
  if (!db) return null;
  try {
    const [row] = await db.select({ data: legacyPhotos.data }).from(legacyPhotos).where(eq(legacyPhotos.id, id));
    if (!row) return null;
    const data = Buffer.from(row.data);
    await writePhotoFile(id, data);
    return data;
  } catch {
    return null;
  }
}

export async function readPhoto(id: string) {
  if (!idPattern.test(id)) return null;
  try {
    return await readFile(photoFile(id));
  } catch {
    return migrateLegacyPhoto(id);
  }
}

export async function photoExists(id: string) {
  if (!idPattern.test(id)) return false;
  try {
    await access(photoFile(id));
    return true;
  } catch {
    return Boolean(await migrateLegacyPhoto(id));
  }
}

export async function storePhoto(input: Buffer) {
  if (!input.length || input.length > photoLimit) {
    throw new Error("Choose a photo up to 8 MB.");
  }

  const image = sharp(input, { limitInputPixels: 32_000_000 });
  let data: Buffer;
  try {
    const { format } = await image.metadata();
    if (!format || !["jpeg", "png", "webp", "avif", "heif", "gif"].includes(format)) {
      throw new Error("Unsupported image");
    }
    data = await image.rotate().resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    }).webp({ quality: 86 }).toBuffer();
  } catch {
    throw new Error("Choose a valid JPEG, PNG, WebP, AVIF, HEIF or GIF photo.");
  }

  const id = createHash("sha256").update(data).digest("hex");
  try {
    await access(photoFile(id));
  } catch {
    await writePhotoFile(id, data);
  }
  return `/api/media/${id}`;
}
