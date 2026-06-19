import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import { invoiceRoutes } from "./routes/invoices";
import { clientRoutes } from "./routes/clients";
import { subscriptionRoutes } from "./routes/subscriptions";
import { auth } from "./routes/auth";

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://zatca-invoice.pages.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes
app.route("/api/auth", auth);

// Protected routes
app.route("/api/invoices", invoiceRoutes);
app.route("/api/clients", clientRoutes);
app.route("/api/subscriptions", subscriptionRoutes);

export default app;
