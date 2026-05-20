import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const body = await request.json() as { name?: unknown };
    const name = body.name;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await db
      .prepare(`SELECT "protected" FROM categories WHERE id = ?`)
      .bind(id)
      .first() as { protected: number } | null;

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    if (existing.protected) {
      return NextResponse.json({ error: "Cannot rename a protected category" }, { status: 403 });
    }

    const trimmed = name.trim().toLowerCase();

    await db
      .prepare("UPDATE categories SET name = ? WHERE id = ?")
      .bind(trimmed, id)
      .run();

    return NextResponse.json({ category: { id, name: trimmed } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("UNIQUE")) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    console.error("PUT /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to rename category" }, { status: 500 });
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

    const existing = await db
      .prepare(`SELECT "protected" FROM categories WHERE id = ?`)
      .bind(id)
      .first() as { protected: number } | null;

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    if (existing.protected) {
      return NextResponse.json({ error: "Cannot delete a protected category" }, { status: 403 });
    }

    const uncategorized = await db
      .prepare(`SELECT id FROM categories WHERE name = 'sin categoría' AND "protected" = 1`)
      .first() as { id: string } | null;

    if (uncategorized) {
      await db
        .prepare("UPDATE images SET category_id = ? WHERE category_id = ?")
        .bind(uncategorized.id, id)
        .run();
    }

    await db
      .prepare("DELETE FROM categories WHERE id = ?")
      .bind(id)
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}