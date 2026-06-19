import { Hono } from "hono";
import type { Env } from "../index";

// Simple JWT sign
async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encoder = new TextEncoder();

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

const auth = new Hono<{ Bindings: Env }>();

// Sign Up
auth.post("/sign-up", async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    const existing = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();

    if (existing) {
      return c.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, 400);
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password + c.env.JWT_SECRET);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const userId = crypto.randomUUID();
    const now = Date.now();

    await c.env.DB.prepare(
      "INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at) VALUES (?, ?, ?, 0, NULL, ?, ?)"
    ).bind(userId, name, email, now, now).run();

    await c.env.DB.prepare(
      "INSERT INTO accounts (id, user_id, account_id, provider_id, password, created_at, updated_at) VALUES (?, ?, ?, 'credential', ?, ?, ?)"
    ).bind(crypto.randomUUID(), userId, userId, passwordHash, now, now).run();

    const sessionToken = crypto.randomUUID();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    await c.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, token, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), userId, sessionToken, expiresAt, now, now).run();

    const token = await signJWT(
      { sub: userId, email, name, exp: Math.floor(expiresAt / 1000) },
      c.env.JWT_SECRET
    );

    return c.json({ user: { id: userId, name, email }, token }, 201);
  } catch (error) {
    return c.json({ error: "حدث خطأ: " + (error as Error).message }, 500);
  }
});

// Sign In
auth.post("/sign-in", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const user = await c.env.DB.prepare(
      "SELECT id, name, email FROM users WHERE email = ?"
    ).bind(email).first<{ id: string; name: string; email: string }>();

    if (!user) {
      return c.json({ error: "بيانات الدخول غير صحيحة" }, 401);
    }

    const account = await c.env.DB.prepare(
      "SELECT password FROM accounts WHERE user_id = ? AND provider_id = 'credential'"
    ).bind(user.id).first<{ password: string }>();

    if (!account) {
      return c.json({ error: "بيانات الدخول غير صحيحة" }, 401);
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password + c.env.JWT_SECRET);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (passwordHash !== account.password) {
      return c.json({ error: "بيانات الدخول غير صحيحة" }, 401);
    }

    const now = Date.now();
    const sessionToken = crypto.randomUUID();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

    await c.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, token, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), user.id, sessionToken, expiresAt, now, now).run();

    const token = await signJWT(
      { sub: user.id, email: user.email, name: user.name, exp: Math.floor(expiresAt / 1000) },
      c.env.JWT_SECRET
    );

    return c.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    return c.json({ error: "حدث خطأ: " + (error as Error).message }, 500);
  }
});

// Sign Out
auth.post("/sign-out", async (c) => {
  return c.json({ success: true });
});

// Get Session
auth.get("/session", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ user: null });
  }

  try {
    const token = authHeader.slice(7);
    const parts = token.split(".");
    if (parts.length !== 3) return c.json({ user: null });

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ user: null });
    }

    const user = await c.env.DB.prepare(
      "SELECT id, name, email FROM users WHERE id = ?"
    ).bind(payload.sub).first();

    if (!user) return c.json({ user: null });
    return c.json({ user });
  } catch {
    return c.json({ user: null });
  }
});

export { auth };
