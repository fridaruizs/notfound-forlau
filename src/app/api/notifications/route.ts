import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyJWT, getJWTSecret, COOKIE_NAME } from "../../lib/auth";

// Admin-only notifications: new notes on the board posted by *other* admins
// since this user last opened the bell / the board.
// Tracking lives in users.notes_seen_at (unix seconds). See migrations/0001_notes_seen_at.sql.

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyJWT(token, getJWTSecret());
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as any).notfound_db as D1Database;
}

// Adds the column on first use if the migration hasn't been run yet.
async function withSeenColumn<T>(db: D1Database, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!String(err).includes("notes_seen_at")) throw err;
    await db.prepare("ALTER TABLE users ADD COLUMN notes_seen_at INTEGER").run();
    return await fn();
  }
}

interface NotificationRow {
  id: string;
  content: string;
  color: string;
  created_at: number;
  author: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const db = await getDb();
    const { results } = await withSeenColumn(db, () =>
      db
        .prepare(`
          SELECT n.id, n.content, n.color, n.created_at,
            COALESCE(u.display_name, u.username) as author
          FROM notes n
          LEFT JOIN users u ON u.id = n.author_id
          WHERE n.author_id IS NOT ?
            AND n.created_at > COALESCE((SELECT notes_seen_at FROM users WHERE id = ?), 0)
          ORDER BY n.created_at DESC
          LIMIT 20
        `)
        .bind(payload.sub, payload.sub)
        .all<NotificationRow>()
    );

    return NextResponse.json({ count: results.length, notes: results });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ error: "Error al obtener notificaciones." }, { status: 500 });
  }
}

// Mark everything as seen.
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const db = await getDb();
    await withSeenColumn(db, () =>
      db.prepare("UPDATE users SET notes_seen_at = unixepoch() WHERE id = ?").bind(payload.sub).run()
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/notifications error:", err);
    return NextResponse.json({ error: "Error al marcar como vistas." }, { status: 500 });
  }
}
