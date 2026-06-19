import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const WORKER_URL = process.env.WORKER_URL || "http://localhost:8787";

async function getSession() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  return allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

export async function GET() {
  try {
    const session = await getSession();
    const res = await fetch(`${WORKER_URL}/api/invoices`, {
      headers: { Cookie: session },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const res = await fetch(`${WORKER_URL}/api/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: session,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
