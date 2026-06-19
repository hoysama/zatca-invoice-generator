import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../index";

const clientRoutes = new Hono<{ Bindings: Env }>();
clientRoutes.use("*", authMiddleware);

// List clients
clientRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await c.env.DB.prepare(
    "SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(userId).all();
  return c.json({ clients: rows.results });
});

// Create client
clientRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const data = await c.req.json();
  const clientId = crypto.randomUUID();
  const now = Date.now();

  await c.env.DB.prepare(
    "INSERT INTO clients (id, user_id, name, email, phone, vat_number, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(clientId, userId, data.name, data.email || null, data.phone || null, data.vatNumber || null, data.address || null, now, now).run();

  const client = await c.env.DB.prepare("SELECT * FROM clients WHERE id = ?").bind(clientId).first();
  return c.json({ client }, 201);
});

// Update client
clientRoutes.put("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const data = await c.req.json();

  const client = await c.env.DB.prepare(
    "SELECT id FROM clients WHERE id = ? AND user_id = ?"
  ).bind(id, userId).first();
  if (!client) return c.json({ error: "Client not found" }, 404);

  await c.env.DB.prepare(
    "UPDATE clients SET name = ?, email = ?, phone = ?, vat_number = ?, address = ?, updated_at = ? WHERE id = ?"
  ).bind(data.name, data.email || null, data.phone || null, data.vatNumber || null, data.address || null, Date.now(), id).run();

  const updated = await c.env.DB.prepare("SELECT * FROM clients WHERE id = ?").bind(id).first();
  return c.json({ client: updated });
});

// Delete client
clientRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const client = await c.env.DB.prepare(
    "SELECT id FROM clients WHERE id = ? AND user_id = ?"
  ).bind(id, userId).first();
  if (!client) return c.json({ error: "Client not found" }, 404);
  await c.env.DB.prepare("DELETE FROM clients WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

export { clientRoutes };
