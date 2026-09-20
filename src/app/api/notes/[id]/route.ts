import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyJWT, getJWTSecret, COOKIE_NAME } from "../../../lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    const payload = await verifyJWT(token, getJWTSecret());
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    await db.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/notes/[id] error:", err);
    return NextResponse.json({ error: "Error al eliminar nota." }, { status: 500 });
  }
}