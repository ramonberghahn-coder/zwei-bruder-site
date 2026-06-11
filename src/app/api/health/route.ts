import { NextResponse } from "next/server";
import {
  databaseUrlDiagnostics,
  getAppDatabaseUrl,
  usesNeonDatabase,
} from "@/lib/database-url";
import { assertDatabase, prismaErrorMessage } from "@/lib/db-errors";
import { getImageStorageMode } from "@/lib/image-storage";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const appUrl = getAppDatabaseUrl();

  if (!appUrl) {
    return NextResponse.json({
      ok: false,
      database: "missing DATABASE_URL",
      hints: databaseUrlDiagnostics(),
    });
  }

  try {
    await assertDatabase(usesNeonDatabase() ? 5 : 3);
    const [productCount, activeProductCount] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
    ]);
    return NextResponse.json({
      ok: true,
      database: "connected",
      driver: usesNeonDatabase() ? "neon-serverless" : "postgres-tcp",
      productCount,
      activeProductCount,
      imageStorage: getImageStorageMode(),
      hints: databaseUrlDiagnostics(),
    });
  } catch (error) {
    const message = prismaErrorMessage(error);
    const quotaExceeded =
      message.includes("cota de transferência") ||
      message.toLowerCase().includes("data transfer quota");
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        driver: usesNeonDatabase() ? "neon-serverless" : "postgres-tcp",
        message,
        quotaExceeded,
        hints: databaseUrlDiagnostics(),
      },
      { status: 503 }
    );
  }
}
