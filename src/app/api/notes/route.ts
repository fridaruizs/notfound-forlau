import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyJWT, getJWTSecret, COOKIE_NAME } from "../../lib/auth";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyJWT(token, getJWTSecret());
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const { results } = await db
      .prepare(`
        SELECT n.id, n.content, n.color, n.created_at,
          COALESCE(u.display_name, u.username) as author
        FROM notes n
        LEFT JOIN users u ON u.id = n.author_id
        ORDER BY n.created_at DESC
      `)
      .all();

    return NextResponse.json({ notes: results });
  } catch (err) {
    console.error("GET /api/notes error:", err);
    return NextResponse.json({ error: "Error al obtener notas." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const body = await request.json() as { content?: string; color?: string };
    const content = body.content?.trim();
    if (!content) return NextResponse.json({ error: "El contenido es requerido." }, { status: 400 });

    const id = crypto.randomUUID();
    const color = body.color ?? "yellow";

    await db
      .prepare("INSERT INTO notes (id, author_id, content, color, created_at) VALUES (?, ?, ?, ?, unixepoch())")
      .bind(id, payload.sub, content, color)
      .run();

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/notes error:", err);
    return NextResponse.json({ error: "Error al crear nota." }, { status: 500 });
  }
}