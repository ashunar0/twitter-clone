import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/lib/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./local.db",
  },
});
