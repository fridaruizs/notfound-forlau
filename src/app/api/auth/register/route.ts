import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { hashPassword, signJWT, getJWTSecret, COOKIE_NAME, SESSION_DURATION } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as any).notfound_db as D1Database;

    const body = await request.json() as {
      username?: string;
      email?: string;
      password?: string;
    };

    const username = body.username?.trim().toLowerCase();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "El usuario debe tener al menos 3 caracteres." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    // Check existing
    const existing = await db
      .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
      .bind(username, email)
      .first();

    if (existing) {
      return NextResponse.json({ error: "El usuario o email ya existe." }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await db
      .prepare(`
        INSERT INTO users (id, username, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, 'user', unixepoch())
      `)
      .bind(id, username, email, passwordHash)
      .run();

    // Sign JWT and set cookie
    const secret = getJWTSecret();
    const token = await signJWT(
      { sub: id, username, role: "user", exp: Math.floor(Date.now() / 1000) + SESSION_DURATION },
      secret
    );

    const response = NextResponse.json({ user: { id, username, role: "user" } }, { status: 201 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json({ error: "Error al registrarse." }, { status: 500 });
  }
}