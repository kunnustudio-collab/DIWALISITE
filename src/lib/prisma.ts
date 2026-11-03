import { PrismaClient } from "@prisma/client";
import path from "node:path";
import fs from "node:fs";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl;
  }

  const prismaDbPath = path.resolve(process.cwd(), "prisma", "dev.db");
  const rootDbPath = path.resolve(process.cwd(), "dev.db");

  if (fs.existsSync(prismaDbPath)) {
    return `file:${prismaDbPath}`;
  }
  if (fs.existsSync(rootDbPath)) {
    return `file:${rootDbPath}`;
  }

  return `file:${prismaDbPath}`;
}

const resolvedDbUrl = getDatabaseUrl();

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: resolvedDbUrl
      ? {
          db: {
            url: resolvedDbUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
