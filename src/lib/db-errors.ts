import { databaseUrlDiagnostics } from "./database-url";

const DATABASE_CONNECTION_HELP = [
  "A Render não consegue alcançar o servidor Postgres. Confira:",
  "1. Confirme que DATABASE_URL é a connection string completa, com usuário, senha, host e banco.",
  "2. Se for Supabase, use a URL de Connection Pooling (Session pooler ou Transaction pooler), não o host direto db.<projeto>.supabase.co se ele falhar na Render.",
  "3. Se for Neon, confirme que o projeto está ativo e sem bloqueio de cota.",
  "4. Confirme que a URL completa tem ?sslmode=require.",
  "5. Salve, faça Manual Deploy e aguarde 1–2 min antes de chamar /api/setup novamente.",
].join("\n");

export function prismaErrorMessage(error: unknown): string {
  if (error instanceof Error && /exceeded the data transfer quota|HTTP status 402/i.test(error.message)) {
    const hints = databaseUrlDiagnostics();
    const extra = hints.length ? `\n\n${hints.join("\n")}` : "";
    return [
      "O projeto Neon excedeu a cota de transferência do plano grátis.",
      "Não é possível resolver isso pelo código enquanto esse projeto estiver bloqueado.",
      "Opções: aguardar o reset da cota, fazer upgrade no Neon ou trocar DATABASE_URL para outro Postgres com cota disponível (ex.: Supabase Free).",
      extra,
    ].join("\n");
  }

  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (code === "P2021") {
      return "Tabelas do banco não existem. Abra /api/setup?token=SUA_SENHA_ADMIN no navegador.";
    }
    if (code === "P1001" || code === "P1000") {
      const hints = databaseUrlDiagnostics();
      const extra = hints.length ? `\n\n${hints.join("\n")}` : "";
      return `${DATABASE_CONNECTION_HELP}${extra}`;
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
