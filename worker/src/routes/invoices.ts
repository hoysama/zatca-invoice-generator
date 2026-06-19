import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../index";

const invoiceRoutes = new Hono<{ Bindings: Env }>();
invoiceRoutes.use("*", authMiddleware);

// List invoices
invoiceRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await c.env.DB.prepare(
    "SELECT i.*, c.name as client_name FROM invoices i LEFT JOIN clients c ON i.client_id = c.id WHERE i.user_id = ? ORDER BY i.created_at DESC"
  ).bind(userId).all();
  return c.json({ invoices: rows.results });
});

// Get single invoice
invoiceRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const invoice = await c.env.DB.prepare(
    "SELECT i.*, c.name as client_name FROM invoices i LEFT JOIN clients c ON i.client_id = c.id WHERE i.id = ? AND i.user_id = ?"
  ).bind(id, userId).first();
  if (!invoice) return c.json({ error: "Invoice not found" }, 404);
  return c.json({ invoice });
});

// Create invoice
invoiceRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const data = await c.req.json();
  const { clientId, items, taxRate = 0.15, notes } = data;

  const subtotal = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const now = Date.now();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  const invoiceNumber = `INV-${dateStr}-${random}`;
  const invoiceId = crypto.randomUUID();

  await c.env.DB.prepare(
    "INSERT INTO invoices (id, user_id, client_id, invoice_number, items, subtotal, tax_rate, tax_amount, total, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)"
  ).bind(invoiceId, userId, clientId, invoiceNumber, JSON.stringify(items), subtotal, taxRate, taxAmount, total, notes || null, now, now).run();

  // Increment invoice count
  await c.env.DB.prepare(
    "UPDATE subscriptions SET invoice_count = invoice_count + 1, updated_at = ? WHERE user_id = ?"
  ).bind(now, userId).run();

  const invoice = await c.env.DB.prepare(
    "SELECT * FROM invoices WHERE id = ?"
  ).bind(invoiceId).first();

  return c.json({ invoice }, 201);
});

// Delete invoice
invoiceRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const invoice = await c.env.DB.prepare(
    "SELECT id FROM invoices WHERE id = ? AND user_id = ?"
  ).bind(id, userId).first();
  if (!invoice) return c.json({ error: "Invoice not found" }, 404);
  await c.env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

export { invoiceRoutes };
