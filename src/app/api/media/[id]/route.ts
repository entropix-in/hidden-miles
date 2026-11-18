import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { photos } from "@/db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db || !/^[a-f0-9]{64}$/.test(id)) return new Response(null, { status: 404 });

  const [photo] = await db.select({ data: photos.data }).from(photos).where(eq(photos.id, id));
  if (!photo) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
