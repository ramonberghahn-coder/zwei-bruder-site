import { execSync } from "child_process";
import { NextResponse } from "next/server";
import {
  databaseUrlDiagnostics,
  getMigrateDatabaseUrl,
} from "@/lib/database-url";
import { prismaErrorMessage } from "@/lib/db-errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function commandErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const err = error as { stderr?: string; stdout?: string; message?: string };
    const detail = [err.stderr, err.stdout].filter(Boolean).join("\n").trim();
    if (detail) return detail.slice(0, 3000);
    if (err.message) return err.message;
  }
  return prismaErrorMessage(error);
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const migrateUrl = getMigrateDatabaseUrl();
  if (!migrateUrl) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL não configurada na Render. Adicione a connection string Direct do Neon.",
        hints: databaseUrlDiagnostics(),
      },
      { status: 500 }
    );
  }

  const pushEnv = {
    ...process.env,
    DATABASE_URL: migrateUrl,
  };

  try {
    execSync("npx prisma db push", {
      stdio: "pipe",
      env: pushEnv,
      encoding: "utf-8",
    });
    execSync("node prisma/seed.mjs", {
      stdio: "pipe",
      env: pushEnv,
      encoding: "utf-8",
    });
    return NextResponse.json({
      ok: true,
      message: "Banco criado e dados iniciais carregados com sucesso.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: commandErrorMessage(error),
        hints: databaseUrlDiagnostics(),
      },
      { status: 500 }
    );
  }
}
