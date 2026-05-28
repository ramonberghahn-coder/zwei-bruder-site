"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-20 text-center">
      <h1 className="text-2xl font-medium">Algo deu errado</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Tente recarregar a página. Se o problema continuar, confira se o banco foi
        configurado em <code className="text-xs">/api/setup</code>.
      </p>
      <button type="button" className="btn btn-primary mt-6" onClick={() => reset()}>
        Tentar novamente
      </button>
    </div>
  );
}
