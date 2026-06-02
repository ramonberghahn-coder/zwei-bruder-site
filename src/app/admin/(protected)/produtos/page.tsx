import Link from "next/link";
import ProductTable from "@/components/admin/product-table";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/settings";
import { parseImages, productImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

function toRow(p: {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  images: string;
}) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    active: p.active,
    image: productImageUrl(parseImages(p.images)[0]),
  };
}

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let configuredCategories: string[] = [];
  let loadError = false;

  try {
    products = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    configuredCategories = await getCategories();
  } catch {
    loadError = true;
  }

  const productCategories = new Set(products.map((p) => p.category).filter(Boolean));
  const categoryOrder = [
    ...configuredCategories.filter((c) => productCategories.has(c)),
    ...[...productCategories].filter((c) => !configuredCategories.includes(c)),
  ];

  const uncategorized = products.filter((p) => !p.category?.trim());
  const groups = [
    ...categoryOrder.map((category) => ({
      category,
      products: products.filter((p) => p.category === category),
    })),
    ...(uncategorized.length > 0
      ? [{ category: "Sem categoria", products: uncategorized }]
      : []),
  ].filter((g) => g.products.length > 0);

  return (
    <div className="container admin-page">
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
            Produtos agrupados por categoria. Arraste pelo ícone{" "}
            <span className="font-medium">⠿</span> ou use as setas para reordenar dentro de cada
            grupo.
          </p>
          <div className="mt-8 space-y-10">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="border-b border-neutral-200 pb-2 text-lg font-medium">
                  {group.category}
                  <span className="ml-2 text-sm font-normal text-neutral-500">
                    ({group.products.length})
                  </span>
                </h2>
                <ProductTable compact products={group.products.map(toRow)} />
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
