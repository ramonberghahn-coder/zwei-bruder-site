import { NextResponse } from "next/server";
import { databaseUrlDiagnostics, getHttpDatabaseUrl } from "@/lib/database-url";
import { prismaErrorMessage } from "@/lib/db-errors";
import { countProducts, runSeed } from "@/lib/run-seed";
import { ensureDatabaseSchema } from "@/lib/setup-schema";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const databaseUrl = getHttpDatabaseUrl();
  if (!databaseUrl) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL não configurada na Render. Adicione a connection string do Neon/Postgres.",
        hints: databaseUrlDiagnostics(),
      },
      { status: 500 }
    );
  }

  try {
    await ensureDatabaseSchema();
  } catch (error) {
    return NextResponse.json(
      {
        error: prismaErrorMessage(error),
        step: "schema_http",
        hints: databaseUrlDiagnostics(),
      },
      { status: 500 }
    );
  }

  // O schema já foi aplicado com sucesso neste ponto. O seed apenas insere
  // dados de exemplo (ON CONFLICT DO NOTHING), então uma falha aqui não bloqueia
  // dados existentes. Se o banco continuar sem produtos, a falha é crítica para
  // a vitrine inicial e precisa aparecer no setup.
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
