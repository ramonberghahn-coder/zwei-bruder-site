"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container page-y text-center">
      <h1 className="text-2xl font-medium">Algo deu errado</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Tente recarregar a página. Se a loja estiver vazia ou o erro continuar, abra no
        navegador{" "}
        <code className="text-xs">/api/setup?token=SUA_SENHA_ADMIN</code> (use a mesma senha
        do painel) e depois{" "}
        <a href="/api/health" className="underline">
          /api/health
        </a>{" "}
        para confirmar a conexão com o banco.
      </p>
      <button type="button" className="btn btn-primary mt-6" onClick={() => reset()}>
        Tentar novamente
      </button>
    </div>
  );
}
