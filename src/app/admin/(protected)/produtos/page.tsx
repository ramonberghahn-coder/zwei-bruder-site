import Link from "next/link";
import ProductTable from "@/components/admin/product-table";
import { prisma } from "@/lib/prisma";
import { parseImages, productImageUrl } from "@/lib/utils";

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
        <ProductTable
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            active: p.active,
            image: productImageUrl(parseImages(p.images)[0]),
          }))}
        />
      )}
    </div>
  );
}
