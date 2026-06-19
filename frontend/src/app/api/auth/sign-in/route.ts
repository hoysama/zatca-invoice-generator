import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.WORKER_URL || "http://localhost:8787";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${WORKER_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error || "فشل تسجيل الدخول" }, { status: res.status });
    }

    const response = NextResponse.json({ success: true, user: data.user });
    if (data.token) {
      response.cookies.set("auth_token", data.token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
