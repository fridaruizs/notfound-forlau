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

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const imageId = crypto.randomUUID();
    const ext = file.name.split(".").pop() ?? "jpg";
    const r2Key = `images/${imageId}.${ext}`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    // Save metadata to D1
    await db
      .prepare(`
        INSERT INTO images (id, r2_key, title, description, source_url, visibility, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, unixepoch())
      `)
      .bind(imageId, r2Key, title || null, description || null, sourceUrl || null, visibility)
      .run();

    // Save category associations
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
    const bucket = (env as any).notfound_images as R2Bucket;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    let query = `
      SELECT i.id, i.r2_key, i.title, i.description, i.source_url, i.visibility, i.uploaded_at,
        GROUP_CONCAT(c.name, ',') as categories
      FROM images i
      LEFT JOIN image_categories ic ON ic.image_id = i.id
      LEFT JOIN categories c ON c.id = ic.category_id
    `;

    const params: string[] = [];
    if (categoryId) {
      query += ` WHERE ic.category_id = ?`;
      params.push(categoryId);
    }

    query += ` GROUP BY i.id ORDER BY i.uploaded_at DESC`;

    const { results } = await db.prepare(query).bind(...params).all();

    // Generate public URLs from R2
    const images = await Promise.all(
      (results as any[]).map(async (img) => {
        const obj = await bucket.get(img.r2_key);
        if (!obj) return { ...img, url: null };
        // Return the R2 key — frontend will fetch via /api/images/[id]/file
        return {
          ...img,
          categories: img.categories ? img.categories.split(",") : [],
        };
      })
    );

    return NextResponse.json({ images });
  } catch (err) {
    console.error("GET /api/images error:", err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
