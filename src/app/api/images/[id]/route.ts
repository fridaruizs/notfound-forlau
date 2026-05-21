import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;
    const bucket = (env as any).notfound_images as R2Bucket;

    const image = await db
      .prepare("SELECT r2_key FROM images WHERE id = ?")
      .bind(id)
      .first() as { r2_key: string } | null;

    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const obj = await bucket.get(image.r2_key);
    if (!obj) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", obj.httpMetadata?.contentType ?? "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(obj.body, { headers });
  } catch (err) {
    console.error("GET /api/images/[id] error:", err);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}
