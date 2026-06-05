import { databaseUrlDiagnostics } from "./database-url";

const P1001_HELP = [
  "A Render não consegue alcançar o servidor Postgres (Neon). Confira:",
  "1. No painel Neon: projeto ativo (não excluído) — abra o projeto para acordar se estiver suspenso.",
  "2. Se DATABASE_URL tiver host com -pooler, o /api/setup tenta usar automaticamente o host Direct sem -pooler.",
  "3. Se ainda falhar, crie DIRECT_DATABASE_URL na Render com a connection string PostgreSQL Direct do Neon.",
  "4. Confirme que a URL completa tem ?sslmode=require.",
  "5. Salve, faça Manual Deploy e aguarde 1–2 min antes de chamar /api/setup novamente.",
].join("\n");

export function prismaErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (code === "P2021") {
      return "Tabelas do banco não existem. Abra /api/setup?token=SUA_SENHA_ADMIN no navegador.";
    }
    if (code === "P1001" || code === "P1000") {
      const hints = databaseUrlDiagnostics();
      const extra = hints.length ? `\n\n${hints.join("\n")}` : "";
      return `${P1001_HELP}${extra}`;
    }
  }
  if (error instanceof Error) return error.message;
  return "Erro no banco de dados.";
}

export async function assertDatabase(retries = 3): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (error) {
      lastError = error;
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: string }).code)
          : "";
      if (code === "P1001" && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
