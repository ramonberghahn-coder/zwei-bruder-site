import { execSync } from "child_process";
import { NextResponse } from "next/server";
import {
  databaseUrlDiagnostics,
  getMigrateDatabaseUrl,
} from "@/lib/database-url";
import { prismaErrorMessage } from "@/lib/db-errors";
import { countProducts, runSeed } from "@/lib/run-seed";

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
  } catch (error) {
    return NextResponse.json(
      {
        error: commandErrorMessage(error),
        step: "db_push",
        hints: databaseUrlDiagnostics(),
      },
      { status: 500 }
    );
  }

  // O schema (db_push) já foi aplicado com sucesso neste ponto. O seed apenas
  // insere dados de exemplo (ON CONFLICT DO NOTHING), então uma falha aqui não
  // bloqueia dados existentes. Se o banco continuar sem produtos, a falha é
  // crítica para a vitrine inicial e precisa aparecer no setup.
  try {
    const seedResult = await runSeed();
    return NextResponse.json({
      ok: true,
      schema: "updated",
      seed: "ok",
      productCount: seedResult.productCount,
      message: "Banco atualizado e dados iniciais carregados com sucesso.",
      hints: databaseUrlDiagnostics(),
    });
  } catch (error) {
    let productCount = 0;
    try {
      productCount = await countProducts();
    } catch {
      productCount = 0;
    }

    const body = {
      ok: productCount > 0,
      schema: "updated",
      seed: "skipped",
      productCount,
      seedError: prismaErrorMessage(error),
      message:
        productCount > 0
          ? "Schema do banco atualizado com sucesso. O seed de dados de exemplo falhou, mas já existem produtos cadastrados."
          : "Schema do banco atualizado, mas o seed falhou e o banco continua sem produtos. Rode /api/setup novamente após corrigir o erro informado.",
      hints: databaseUrlDiagnostics(),
    };

    return NextResponse.json(body, { status: productCount > 0 ? 200 : 500 });
  }
}
