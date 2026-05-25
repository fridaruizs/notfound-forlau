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

    if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const obj = await bucket.get(image.r2_key);
    if (!obj) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const headers = new Headers();
    headers.set("Content-Type", obj.httpMetadata?.contentType ?? "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(obj.body, { headers });
  } catch (err) {
    console.error("GET /api/images/[id] error:", err);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const body = await request.json() as {
      title?: string;
      description?: string;
      source_url?: string;
      visibility?: string;
      category_ids?: string[];
    };

    const existing = await db
      .prepare("SELECT id FROM images WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    await db
      .prepare(`
        UPDATE images
        SET title = ?, description = ?, source_url = ?, visibility = ?
        WHERE id = ?
      `)
      .bind(
        body.title?.trim() || null,
        body.description?.trim() || null,
        body.source_url?.trim() || null,
        body.visibility ?? "public",
        id
      )
      .run();

    if (body.category_ids !== undefined) {
      await db
        .prepare("DELETE FROM image_categories WHERE image_id = ?")
        .bind(id)
        .run();

      if (body.category_ids.length > 0) {
        const placeholders = body.category_ids.map(() => "(?, ?)").join(", ");
        const values = body.category_ids.flatMap(catId => [id, catId]);
        await db
          .prepare(`INSERT OR IGNORE INTO image_categories (image_id, category_id) VALUES ${placeholders}`)
          .bind(...values)
          .run();
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/images/[id] error:", err);
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}

export async function DELETE(
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

    if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await bucket.delete(image.r2_key);
    await db.prepare("DELETE FROM images WHERE id = ?").bind(id).run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/images/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}