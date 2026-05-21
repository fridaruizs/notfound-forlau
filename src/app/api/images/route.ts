import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;
    const bucket = (env as any).notfound_images as R2Bucket;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const sourceUrl = formData.get("source_url") as string | null;
    const visibility = (formData.get("visibility") as string) || "public";
    const categoryIds = formData.getAll("category_ids") as string[];

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const imageId = crypto.randomUUID();
    const ext = file.name.split(".").pop() ?? "jpg";
    const r2Key = `images/${imageId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    await db
      .prepare(`
        INSERT INTO images (id, r2_key, title, description, source_url, visibility, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, unixepoch())
      `)
      .bind(imageId, r2Key, title || null, description || null, sourceUrl || null, visibility)
      .run();

    if (categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => "(?, ?)").join(", ");
      const values = categoryIds.flatMap(catId => [imageId, catId]);
      await db
        .prepare(`INSERT OR IGNORE INTO image_categories (image_id, category_id) VALUES ${placeholders}`)
        .bind(...values)
        .run();
    }

    return NextResponse.json({ image: { id: imageId, r2_key: r2Key } }, { status: 201 });
  } catch (err) {
    console.error("POST /api/images error:", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    let query: string;
    const params: string[] = [];

    if (categoryId) {
      query = `
        SELECT i.id, i.r2_key, i.title, i.description, i.source_url, i.visibility, i.uploaded_at,
          GROUP_CONCAT(c.name, ',') as categories
        FROM images i
        INNER JOIN image_categories ic ON ic.image_id = i.id
        LEFT JOIN image_categories ic2 ON ic2.image_id = i.id
        LEFT JOIN categories c ON c.id = ic2.category_id
        WHERE ic.category_id = ?
        GROUP BY i.id
        ORDER BY i.uploaded_at DESC
      `;
      params.push(categoryId);
    } else {
      query = `
        SELECT i.id, i.r2_key, i.title, i.description, i.source_url, i.visibility, i.uploaded_at,
          GROUP_CONCAT(c.name, ',') as categories
        FROM images i
        LEFT JOIN image_categories ic ON ic.image_id = i.id
        LEFT JOIN categories c ON c.id = ic.category_id
        GROUP BY i.id
        ORDER BY i.uploaded_at DESC
      `;
    }

    const { results } = await db.prepare(query).bind(...params).all();

    const images = (results as any[]).map(img => ({
      ...img,
      categories: img.categories ? img.categories.split(",") : [],
    }));

    return NextResponse.json({ images });
  } catch (err) {
    console.error("GET /api/images error:", err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}