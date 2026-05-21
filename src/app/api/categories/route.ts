import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const { results } = await db
      .prepare(`
        SELECT id, name, "protected",
          (SELECT COUNT(*) FROM image_categories WHERE category_id = categories.id) as image_count
        FROM categories
        ORDER BY "protected" DESC, name ASC
      `)
      .all();

    return NextResponse.json({ categories: results });
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const body = await request.json() as { name?: unknown };
    const name = body.name;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const trimmed = name.trim().toLowerCase();
    const id = crypto.randomUUID();

    await db
      .prepare(`INSERT INTO categories (id, name, "protected") VALUES (?, ?, 0)`)
      .bind(id, trimmed)
      .run();

    return NextResponse.json(
      { category: { id, name: trimmed, protected: 0, image_count: 0 } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("UNIQUE")) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    console.error("POST /api/categories error:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}