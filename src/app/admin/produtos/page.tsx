import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="subtitle">Catálogo</p>
          <h1 className="mt-2 text-5xl font-semibold">Produtos</h1>
        </div>
        <Link className="btn btn-primary" href="/admin/produtos/novo">
          Novo produto
        </Link>
      </div>
      <div className="mt-8 overflow-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left uppercase tracking-wider text-neutral-600">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <Link className="text-blue-600" href={`/admin/produtos/${p.id}/editar`}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
