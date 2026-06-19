import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const WORKER_URL = process.env.WORKER_URL || "http://localhost:8787";

async function getSession() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  return allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

// Auth routes - proxy to worker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "sign-up";

    const res = await fetch(`${WORKER_URL}/api/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Authentication failed" }, { status: res.status });
    }

    // Set token in cookie
    const response = NextResponse.json({ success: true, user: data.user });
    if (data.token) {
      response.cookies.set("auth_token", data.token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    const res = await fetch(`${WORKER_URL}/api/auth/session`, {
      headers: { Cookie: session },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}
