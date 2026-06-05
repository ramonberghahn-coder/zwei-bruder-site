import { neon } from "@neondatabase/serverless";
import { getHttpDatabaseConfig } from "@/lib/database-url";

async function withRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : "";
      const transient =
        /fetch failed|terminated|connection|econnreset|timeout|socket/i.test(msg);
      if (!transient || attempt === tries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
  }

  throw lastError;
}

export async function ensureDatabaseSchema(): Promise<void> {
  const config = getHttpDatabaseConfig();
  if (!config) {
    throw new Error("DATABASE_URL não configurada na Render.");
  }
  if (!config.hasPassword) {
    throw new Error(
      `${config.source} está sem senha. Copie a connection string completa do Neon, incluindo usuário e senha.`
    );
  }

  const sql = neon(config.url);

  await withRetry(() => sql`SELECT 1`);

  await withRetry(
    () => sql`
      CREATE TABLE IF NOT EXISTS "Product" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "compareAt" DOUBLE PRECISION,
        category TEXT NOT NULL,
        images TEXT NOT NULL DEFAULT '[]',
        stock INTEGER NOT NULL DEFAULT 0,
        weight INTEGER NOT NULL DEFAULT 500,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT false,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
  );

  await withRetry(
    () => sql`
      CREATE TABLE IF NOT EXISTS "Order" (
        id TEXT PRIMARY KEY,
        "orderNumber" TEXT NOT NULL,
        "customerName" TEXT NOT NULL,
        "customerPhone" TEXT NOT NULL,
        "customerEmail" TEXT,
        address TEXT,
        notes TEXT,
        items TEXT NOT NULL,
        subtotal DOUBLE PRECISION NOT NULL,
        "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "shippingService" TEXT,
        "shippingCep" TEXT,
        "deliveryMethod" TEXT,
        "engravingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "engravingInfo" TEXT,
        total DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL DEFAULT 'reserved',
        "paymentProofUrl" TEXT,
        "pixPayload" TEXT,
        "whatsappSent" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
  );

  await withRetry(
    () => sql`
      CREATE TABLE IF NOT EXISTS "Setting" (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `
  );

  await withRetry(
    () => sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key"
      ON "Product" (slug)
    `
  );
  await withRetry(
    () => sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key"
      ON "Order" ("orderNumber")
    `
  );

  await withRetry(
    () => sql`
      ALTER TABLE "Product"
        ADD COLUMN IF NOT EXISTS "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "compareAt" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS weight INTEGER NOT NULL DEFAULT 500,
        ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true
    `
  );

  await withRetry(
    () => sql`
      ALTER TABLE "Order"
        ADD COLUMN IF NOT EXISTS "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "shippingService" TEXT,
        ADD COLUMN IF NOT EXISTS "shippingCep" TEXT,
        ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT,
        ADD COLUMN IF NOT EXISTS "engravingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "engravingInfo" TEXT,
        ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "pixPayload" TEXT,
        ADD COLUMN IF NOT EXISTS "whatsappSent" BOOLEAN NOT NULL DEFAULT false
    `
  );
}
