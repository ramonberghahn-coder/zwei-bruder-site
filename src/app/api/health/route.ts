import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasDb = Boolean(process.env.DATABASE_URL?.trim());

  if (!hasDb) {
    return NextResponse.json({
      ok: false,
      database: "missing DATABASE_URL",
    });
  }

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 8_000);
      }),
    ]);
    const productCount = await prisma.product.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      productCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { ok: false, database: "error", message },
      { status: 503 }
    );
  }
}
