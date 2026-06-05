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

export function deriveNeonDirectUrl(raw: string): string {
  const url = sanitizeEnvUrl(raw);
  if (!url || !url.includes("neon.tech") || !url.includes("-pooler")) {
    return url;
  }

  try {
    const parsed = new URL(url.replace(/^postgres:\/\//, "postgresql://"));
    parsed.hostname = parsed.hostname.replace(/-pooler(?=\.)/, "");
    return parsed.toString();
  } catch {
    return url.replace("-pooler.", ".");
  }
}

export function getAppDatabaseUrl(): string | undefined {
  const direct = sanitizeEnvUrl(process.env.DIRECT_DATABASE_URL ?? "");
  const pooled = sanitizeEnvUrl(process.env.DATABASE_URL ?? "");
  const raw = direct || pooled;
  if (!raw) return undefined;
  return normalizeDatabaseUrl(raw);
}

export function getMigrateDatabaseUrl(): string | undefined {
  const direct = sanitizeEnvUrl(process.env.DIRECT_DATABASE_URL ?? "");
  const pooled = sanitizeEnvUrl(process.env.DATABASE_URL ?? "");
  const raw = direct || deriveNeonDirectUrl(pooled);
  if (!raw) return undefined;
  return normalizeDatabaseUrl(raw);
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
  const effective = direct || url;

  if (!url && !direct) {
    hints.push("DATABASE_URL não está definida na Render.");
    return hints;
  }

  const host = effective ? parseDatabaseHost(normalizeDatabaseUrl(effective)) : null;
  if (host) {
    hints.push(`Host detectado: ${host}`);
    if (host.includes("-pooler") && direct) {
      hints.push("DATABASE_URL está no pooler, mas DIRECT_DATABASE_URL será usado no /api/setup.");
    } else if (host.includes("-pooler")) {
      const migrateHost = parseDatabaseHost(normalizeDatabaseUrl(deriveNeonDirectUrl(effective)));
      if (migrateHost && migrateHost !== host) {
        hints.push(`Para /api/setup, o host Direct será derivado automaticamente: ${migrateHost}`);
      } else {
        hints.push("Use também DIRECT_DATABASE_URL com o host Direct (sem -pooler) para /api/setup.");
      }
    }
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

  if (!direct && url.includes("neon.tech") && !url.includes("-pooler")) {
    hints.push("Recomendado: defina DIRECT_DATABASE_URL com a URL Direct do Neon.");
  }

  return hints;
}

export function usesNeonDatabase(): boolean {
  const url = getAppDatabaseUrl() ?? "";
  return url.includes("neon.tech");
}
