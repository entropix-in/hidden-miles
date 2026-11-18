import { hasAdminSession } from "@/lib/admin-auth";
import { storePhoto } from "@/lib/media";
import { photoLimit } from "@/lib/media-path";

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return Response.json({ error: "Sign in to upload photos." }, { status: 401 });
  }

  if (Number(request.headers.get("content-length")) > photoLimit) {
    return Response.json({ error: "Choose a photo up to 8 MB." }, { status: 413 });
  }

  try {
    const body = request.body;
    if (!body) throw new Error("Choose a photo to upload.");
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > photoLimit) {
        await reader.cancel();
        return Response.json({ error: "Choose a photo up to 8 MB." }, { status: 413 });
      }
      chunks.push(value);
    }

    return Response.json({ url: await storePhoto(Buffer.concat(chunks)) });
  } catch (error) {
    const message = error instanceof Error && error.message.startsWith("Choose")
      ? error.message
      : "Photo upload failed. Try again.";
    return Response.json({ error: message }, { status: 400 });
  }
}
