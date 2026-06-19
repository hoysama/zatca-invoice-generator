import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "./db";

export function getAuth(database: D1Database, secret: string, url: string) {
  const db = createDb(database);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    secret,
    baseURL: url,
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
