import { NextResponse } from "next/server";
import {
  databaseUrlDiagnostics,
  getAppDatabaseUrl,
  usesNeonDatabase,
} from "@/lib/database-url";
import { assertDatabase, prismaErrorMessage } from "@/lib/db-errors";
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
    const productCount = await prisma.product.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      driver: usesNeonDatabase() ? "neon-serverless" : "postgres-tcp",
      productCount,
      hints: databaseUrlDiagnostics(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        driver: usesNeonDatabase() ? "neon-serverless" : "postgres-tcp",
        message: prismaErrorMessage(error),
        hints: databaseUrlDiagnostics(),
      },
      { status: 503 }
    );
  }
}
