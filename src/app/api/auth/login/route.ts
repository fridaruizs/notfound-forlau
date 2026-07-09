import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyPassword, signJWT, getJWTSecret, COOKIE_NAME, SESSION_DURATION } from "@/app/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const body = await request.json() as {
      username?: string;
      password?: string;
    };

    const username = body.username?.trim().toLowerCase();
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña requeridos." }, { status: 400 });
    }

    const user = await db
      .prepare("SELECT id, username, email, password_hash, role FROM users WHERE username = ? OR email = ?")
      .bind(username, username)
      .first() as { id: string; username: string; email: string; password_hash: string; role: string } | null;

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
    }

    const secret = getJWTSecret();
    const token = await signJWT(
      { sub: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + SESSION_DURATION },
      secret
    );

    const response = NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Error al iniciar sesión." }, { status: 500 });
  }
}