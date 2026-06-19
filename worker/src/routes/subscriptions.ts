import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../index";

const subscriptionRoutes = new Hono<{ Bindings: Env }>();
subscriptionRoutes.use("*", authMiddleware);

// Get current subscription
subscriptionRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  let subscription = await c.env.DB.prepare(
    "SELECT * FROM subscriptions WHERE user_id = ?"
  ).bind(userId).first();

  if (!subscription) {
    const id = crypto.randomUUID();
    const now = Date.now();
    await c.env.DB.prepare(
      "INSERT INTO subscriptions (id, user_id, plan, status, invoice_count, created_at, updated_at) VALUES (?, ?, 'free', 'active', 0, ?, ?)"
    ).bind(id, userId, now, now).run();
    subscription = await c.env.DB.prepare("SELECT * FROM subscriptions WHERE id = ?").bind(id).first();
  }

  return c.json({ subscription });
});

// Get invoice limit
subscriptionRoutes.get("/limit", async (c) => {
  const userId = c.get("userId");
  const sub = await c.env.DB.prepare(
    "SELECT plan, invoice_count FROM subscriptions WHERE user_id = ?"
  ).bind(userId).first<{ plan: string; invoice_count: number }>();

  const plan = sub?.plan || "free";
  const limits: Record<string, number> = { free: 5, basic: 100, pro: 999999, business: 999999 };

  return c.json({ plan, limit: limits[plan], used: sub?.invoice_count || 0 });
});

export { subscriptionRoutes };
