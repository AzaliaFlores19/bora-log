/// <reference types="node" />

import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --loader ts-node/esm --no-warnings prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
