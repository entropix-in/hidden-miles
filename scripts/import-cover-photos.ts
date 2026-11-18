import { and, eq, getTableName, like } from "drizzle-orm";
import { getDb } from "@/db";
import { destinations, experiences, tours } from "@/db/schema";
import { storePhoto } from "@/lib/media";
import { photoLimit } from "@/lib/media-path";

async function main() {
  const db = getDb();
  if (!db) throw new Error("Configure the database before importing photos.");

  const imported = new Map<string, string>();
  for (const table of [tours, destinations, experiences]) {
    const rows = await db.select({ id: table.id, image: table.image })
      .from(table).where(like(table.image, "http%"));
    let count = 0;
    for (const { id, image } of rows) {
      try {
        let path = imported.get(image);
        if (!path) {
          const url = new URL(image);
          if (url.protocol !== "https:" || url.host !== "images.unsplash.com") {
            throw new Error("External host requires review.");
          }
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
          path = await storePhoto(Buffer.concat(chunks));
          imported.set(image, path);
        }
        const [result] = await db.update(table).set({ image: path })
          .where(and(eq(table.id, id), eq(table.image, image)));
        count += result.affectedRows;
      } catch (error) {
        console.error(`Could not import record ${id}`, error instanceof Error ? error.message : error);
        process.exitCode = 1;
      }
    }
    console.log(`Imported ${count}/${rows.length} covers from ${getTableName(table)}.`);
  }
}

main().then(() => process.exit(process.exitCode ?? 0)).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
