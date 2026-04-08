import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), then .env as fallback
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use DIRECT_URL for migrations (bypasses Neon connection pooler)
    // Falls back to DATABASE_URL if DIRECT_URL is not set
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
