import { execSync } from "child_process";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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
    const message = error instanceof Error ? error.message : "Erro ao configurar banco.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
