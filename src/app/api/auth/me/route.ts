import { NextRequest, NextResponse } from "next/server";
import { verifyJWT, getJWTSecret, COOKIE_NAME } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ user: null });

    const payload = await verifyJWT(token, getJWTSecret());
    if (!payload) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: { id: payload.sub, username: payload.username, role: payload.role }
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}