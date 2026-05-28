/**
 * Normaliza a URL do Postgres (Neon + Render).
 * - sslmode=require (obrigatório na Neon)
 * - connect_timeout para acordar projeto suspenso
 */
export function normalizeDatabaseUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return url;

  const isNeon = url.includes("neon.tech");
  const isPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://");
  if (!isPostgres) return url;

  const parsed = new URL(url.replace(/^postgres:\/\//, "postgresql://"));
  if (isNeon && !parsed.searchParams.has("sslmode")) {
    parsed.searchParams.set("sslmode", "require");
  }
  if (!parsed.searchParams.has("connect_timeout")) {
    parsed.searchParams.set("connect_timeout", "15");
  }

  return parsed.toString();
}

/** URL para queries da aplicação (pode ser pooler). */
export function getAppDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  return normalizeDatabaseUrl(raw);
}

/** URL para migrations / db push (preferir Direct, sem -pooler). */
export function getMigrateDatabaseUrl(): string | undefined {
  const direct = process.env.DIRECT_DATABASE_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  const raw = direct || pooled;
  if (!raw) return undefined;
  return normalizeDatabaseUrl(raw);
}

export function databaseUrlDiagnostics(): string[] {
  const hints: string[] = [];
  const url = process.env.DATABASE_URL?.trim() ?? "";

  if (!url) {
    hints.push("DATABASE_URL não está definida na Render.");
    return hints;
  }

  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    hints.push("DATABASE_URL deve começar com postgresql:// (não use file: ou sqlite).");
  }

  if (url.includes("neon.tech") && url.includes("-pooler")) {
    hints.push(
      "Para /api/setup use a connection string Direct do Neon (host sem -pooler). " +
        "Defina DIRECT_DATABASE_URL com a URL Direct ou troque DATABASE_URL."
    );
  }

  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    hints.push("DATABASE_URL aponta para localhost — use a URL do painel Neon na Render.");
  }

  if (!url.includes("sslmode=") && url.includes("neon.tech")) {
    hints.push("Adicione ?sslmode=require ao final da URL (ou salve de novo após o deploy).");
  }

  return hints;
}
