import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyJWT, getJWTSecret, COOKIE_NAME } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const payload = await verifyJWT(token, getJWTSecret());
    if (!payload) return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });

    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const user = await db
      .prepare("SELECT id, username, email, display_name, bio, birthday, role, created_at FROM users WHERE id = ?")
      .bind(payload.sub)
      .first() as {
        id: string;
        username: string;
        email: string;
        display_name: string | null;
        bio: string | null;
        birthday: string | null;
        role: string;
        created_at: number;
      } | null;

    if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

    const topCategories = await db
      .prepare(`
        SELECT c.name, COUNT(*) as count
        FROM images i
        JOIN image_categories ic ON ic.image_id = i.id
        JOIN categories c ON c.id = ic.category_id
        WHERE i.author_id = ?
        GROUP BY c.id
        ORDER BY count DESC
        LIMIT 3
      `)
      .bind(payload.sub)
      .all();

    return NextResponse.json({
      user,
      topCategories: topCategories.results as { name: string; count: number }[],
    });
  } catch (err) {
    console.error("GET /api/auth/profile error:", err);
    return NextResponse.json({ error: "Error al obtener perfil." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const payload = await verifyJWT(token, getJWTSecret());
    if (!payload) return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });

    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const body = await request.json() as {
      display_name?: string;
      bio?: string;
      birthday?: string;
    };

    await db
      .prepare(`
        UPDATE users
        SET display_name = ?, bio = ?, birthday = ?
        WHERE id = ?
      `)
      .bind(
        body.display_name?.trim() || null,
        body.bio?.trim() || null,
        body.birthday || null,
        payload.sub
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/auth/profile error:", err);
    return NextResponse.json({ error: "Error al actualizar perfil." }, { status: 500 });
  }
}