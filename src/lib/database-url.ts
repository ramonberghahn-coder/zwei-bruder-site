export function sanitizeEnvUrl(raw: string): string {
  let url = raw.trim();
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }
  return url;
}

/**
 * Normaliza a URL do Postgres (Neon + Render).
 */
export function normalizeDatabaseUrl(raw: string): string {
  const url = sanitizeEnvUrl(raw);
  if (!url) return url;

  const isNeon = url.includes("neon.tech");
  const isPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://");
  if (!isPostgres) return url;

  try {
    const parsed = new URL(url.replace(/^postgres:\/\//, "postgresql://"));
    if (isNeon && !parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "30");
    }
    return parsed.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    if (!url.includes("sslmode=")) {
      return `${url}${sep}sslmode=require&connect_timeout=30`;
    }
    return url;
  }
}

function databaseUrlHasPassword(raw: string): boolean {
  const url = sanitizeEnvUrl(raw);
  if (!url) return false;

  try {
    const parsed = new URL(url.replace(/^postgres:\/\//, "postgresql://"));
    return Boolean(parsed.password);
  } catch {
    return false;
  }
}

function databaseUrlSourceName(source: string): string {
  return source === "DATABASE_URL" ? "DATABASE_URL" : "DIRECT_DATABASE_URL";
}

function pickDatabaseUrl(
  candidates: Array<{ source: "DATABASE_URL" | "DIRECT_DATABASE_URL"; raw: string }>
): { source: "DATABASE_URL" | "DIRECT_DATABASE_URL"; raw: string } | undefined {
  const present = candidates.filter((candidate) => candidate.raw);
  if (present.length === 0) return undefined;

  return present.find((candidate) => databaseUrlHasPassword(candidate.raw)) || present[0];
}

export function getAppDatabaseUrl(): string | undefined {
  const direct = sanitizeEnvUrl(process.env.DIRECT_DATABASE_URL ?? "");
  const pooled = sanitizeEnvUrl(process.env.DATABASE_URL ?? "");
  const selected = pickDatabaseUrl([
    { source: "DATABASE_URL", raw: pooled },
    { source: "DIRECT_DATABASE_URL", raw: direct },
  ]);
  if (!selected) return undefined;
  return normalizeDatabaseUrl(selected.raw);
}

export function getHttpDatabaseUrl(): string | undefined {
  return getHttpDatabaseConfig()?.url;
}

export function getHttpDatabaseConfig():
  | { source: "DATABASE_URL" | "DIRECT_DATABASE_URL"; url: string; hasPassword: boolean }
  | undefined {
  const direct = sanitizeEnvUrl(process.env.DIRECT_DATABASE_URL ?? "");
  const pooled = sanitizeEnvUrl(process.env.DATABASE_URL ?? "");
  const selected = pickDatabaseUrl([
    { source: "DATABASE_URL", raw: pooled },
    { source: "DIRECT_DATABASE_URL", raw: direct },
  ]);
  if (!selected) return undefined;

  return {
    source: selected.source,
    url: normalizeDatabaseUrl(selected.raw),
    hasPassword: databaseUrlHasPassword(selected.raw),
  };
}

export function parseDatabaseHost(url: string): string | null {
  try {
    const parsed = new URL(url.replace(/^postgres:\/\//, "postgresql://"));
    return parsed.hostname || null;
  } catch {
    return null;
  }
}

export function databaseUrlDiagnostics(): string[] {
  const hints: string[] = [];
  const url = sanitizeEnvUrl(process.env.DATABASE_URL ?? "");
  const direct = sanitizeEnvUrl(process.env.DIRECT_DATABASE_URL ?? "");
  const selected =
    pickDatabaseUrl([
      { source: "DATABASE_URL", raw: url },
      { source: "DIRECT_DATABASE_URL", raw: direct },
    ]) || null;
  const effective = selected?.raw || "";

  if (!url && !direct) {
    hints.push("DATABASE_URL não está definida na Render.");
    return hints;
  }

  const host = effective ? parseDatabaseHost(normalizeDatabaseUrl(effective)) : null;
  if (host) {
    hints.push(`Host detectado: ${host}`);
    if (selected) {
      hints.push(`URL selecionada: ${databaseUrlSourceName(selected.source)}.`);
    }
    if (host.includes("-pooler")) {
      hints.push("DATABASE_URL está no pooler do Neon; /api/setup usa o driver HTTP e não depende de prisma db push por TCP.");
    }
    if (host.startsWith("db.") && host.endsWith(".supabase.co")) {
      hints.push(
        "Host direto do Supabase detectado. Na Render, prefira a connection string de Connection Pooling do Supabase (host ...pooler.supabase.com), pois o host direto db.<projeto>.supabase.co:5432 pode não ser acessível."
      );
    }
  }

  const missingPassword = [
    { source: "DATABASE_URL", raw: url },
    { source: "DIRECT_DATABASE_URL", raw: direct },
  ]
    .filter((candidate) => candidate.raw && !databaseUrlHasPassword(candidate.raw))
    .map((candidate) => databaseUrlSourceName(candidate.source));

  if (missingPassword.length > 0) {
    hints.push(
      `${missingPassword.join(" e ")} sem senha. Copie a connection string completa do Neon, no formato postgresql://usuario:SENHA@host/neondb?sslmode=require.`
    );
  }

  if (
    effective &&
    !effective.startsWith("postgres://") &&
    !effective.startsWith("postgresql://")
  ) {
    hints.push("A URL deve começar com postgresql://");
  }

  if (effective.includes("localhost") || effective.includes("127.0.0.1")) {
    hints.push("A URL aponta para localhost — cole a connection string do painel Neon.");
  }

  if (effective.includes("neon.tech")) {
    hints.push("No Neon: abra o projeto no console para acordar o banco (free tier).");
    hints.push("No Neon → Settings: desative restrição de IP se estiver ativa.");
    if (!effective.includes("sslmode=")) {
      hints.push("Inclua ?sslmode=require na URL.");
    }
  }

  if (effective.includes("supabase.co") && !effective.includes("pooler.supabase.com")) {
    hints.push("No Supabase: Project Settings → Database → Connection string → Connection pooling. Copie a URL Session pooler ou Transaction pooler.");
  }

  if (!direct && url.includes("neon.tech") && !url.includes("-pooler")) {
    hints.push("Opcional: defina DIRECT_DATABASE_URL se quiser separar a URL Direct da URL pooler.");
  }

  return hints;
}

export function usesNeonDatabase(): boolean {
  const url = getAppDatabaseUrl() ?? "";
  return url.includes("neon.tech");
}
