import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { getAppDatabaseUrl, usesNeonDatabase } from "./database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = getAppDatabaseUrl();

  if (url && usesNeonDatabase()) {
    neonConfig.webSocketConstructor = ws;
    // Roteia queries simples por HTTP fetch em vez de WebSocket: evita
    // "Connection terminated unexpectedly" no host -pooler (Render/serverless).
    neonConfig.poolQueryViaFetch = true;
    const adapter = new PrismaNeon({ connectionString: url });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
