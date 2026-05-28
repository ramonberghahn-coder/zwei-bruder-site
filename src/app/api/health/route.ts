import { NextResponse } from "next/server";
import { databaseUrlDiagnostics, getAppDatabaseUrl } from "@/lib/database-url";
import { prismaErrorMessage } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    await prisma.$queryRaw`SELECT 1`;
    const productCount = await prisma.product.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      productCount,
      hints: databaseUrlDiagnostics(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: prismaErrorMessage(error),
        hints: databaseUrlDiagnostics(),
      },
      { status: 503 }
    );
  }
}
