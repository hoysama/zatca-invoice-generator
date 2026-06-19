import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: "20a229f47d369296c2de6e3a1dbd5454",
    databaseId: "LOCAL_DEV_ID",
    token: "",
  },
} satisfies Config;
