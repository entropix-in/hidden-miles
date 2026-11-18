import { createHash } from "node:crypto";
import sharp from "sharp";
import { getDb } from "@/db";
import { photos } from "@/db/schema";
import { photoLimit } from "@/lib/media-path";

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

  const db = getDb();
  if (!db) throw new Error("Photo storage is unavailable.");
  const id = createHash("sha256").update(data).digest("hex");
  await db.insert(photos).values({ id, data }).onDuplicateKeyUpdate({ set: { id } });
  return `/api/media/${id}`;
}
