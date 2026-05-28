import Link from "next/link";
import { assertDatabase } from "@/lib/db-errors";

export default async function DatabaseBanner() {
  try {
    await assertDatabase();
    return null;
  } catch {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">Banco de dados não configurado ou inacessível.</p>
        <p className="mt-1">
          Abra{" "}
          <Link href="/api/setup" className="underline" target="_blank">
            /api/setup?token=SUA_SENHA_ADMIN
          </Link>{" "}
          no navegador (use a senha do painel) e depois{" "}
          <Link href="/api/health" className="underline" target="_blank">
            /api/health
          </Link>{" "}
          para confirmar a conexão.
        </p>
      </div>
    );
  }
}
