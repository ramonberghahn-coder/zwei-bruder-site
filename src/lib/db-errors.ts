export function prismaErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (code === "P2021") {
      return "Tabelas do banco não existem. Abra /api/setup?token=SUA_SENHA_ADMIN no navegador.";
    }
    if (code === "P1001" || code === "P1000") {
      return "Não foi possível conectar ao banco. Verifique DATABASE_URL na Render (Neon Direct, sem -pooler).";
    }
  }
  if (error instanceof Error) return error.message;
  return "Erro no banco de dados.";
}

export async function assertDatabase(): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$queryRaw`SELECT 1`;
}
