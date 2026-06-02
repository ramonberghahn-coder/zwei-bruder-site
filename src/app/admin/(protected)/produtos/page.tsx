import Link from "next/link";
import DeleteProductButton from "@/components/admin/delete-product-button";
import ProductOrderButtons from "@/components/admin/product-order-buttons";
import { prisma } from "@/lib/prisma";
import { formatCurrency, parseImages, productImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let loadError = false;
  try {
    products = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    loadError = true;
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Produtos</h1>
        <Link className="btn btn-primary" href="/admin/produtos/novo">
          Novo produto
        </Link>
      </div>

      {loadError ? (
        <p className="mt-8 text-sm text-red-600">
          Não foi possível carregar os produtos. Verifique a conexão com o banco em /api/health.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nenhum produto cadastrado ainda.</p>
      ) : (
        <>
        <p className="mt-6 text-sm text-neutral-500">
          Use as setas para definir a ordem em que os produtos aparecem na loja.
        </p>
        <div className="mt-4 overflow-auto border border-neutral-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left uppercase tracking-wider text-neutral-600">
              <tr>
                <th className="px-4 py-3">Ordem</th>
                <th className="px-4 py-3">Imagem</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const image = productImageUrl(parseImages(p.images)[0]);
                return (
                  <tr key={p.id} className="border-t border-neutral-200">
                    <td className="px-4 py-3">
                      <ProductOrderButtons
                        id={p.id}
                        isFirst={i === 0}
                        isLast={i === products.length - 1}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={p.name} className="h-12 w-12 object-cover" />
                    </td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={p.active ? "text-green-700" : "text-neutral-400"}>
                        {p.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link className="text-blue-600 hover:underline" href={`/admin/produtos/${p.id}/editar`}>
                          Editar
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
