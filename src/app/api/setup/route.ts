import { execSync } from "child_process";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function commandErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const err = error as { stderr?: string; stdout?: string; message?: string };
    const detail = [err.stderr, err.stdout].filter(Boolean).join("\n").trim();
    if (detail) return detail.slice(0, 2000);
    if (err.message) return err.message;
  }
  return "Erro ao configurar banco.";
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL inválida na Render. Use a connection string PostgreSQL do Neon (Direct, sem -pooler).",
      },
      { status: 500 }
    );
  }

  try {
    execSync("npx prisma db push", {
      stdio: "pipe",
      env: process.env,
      encoding: "utf-8",
    });
    execSync("node prisma/seed.mjs", {
      stdio: "pipe",
      env: process.env,
      encoding: "utf-8",
    });
    return NextResponse.json({
      ok: true,
      message: "Banco criado e dados iniciais carregados com sucesso.",
    });
  } catch (error) {
    return NextResponse.json({ error: commandErrorMessage(error) }, { status: 500 });
  }
}
