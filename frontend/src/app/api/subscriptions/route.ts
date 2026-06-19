import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const WORKER_URL = process.env.WORKER_URL || "http://localhost:8787";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const session = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const res = await fetch(`${WORKER_URL}/api/subscriptions`, {
      headers: { Cookie: session },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}
