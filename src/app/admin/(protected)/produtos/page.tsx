import Link from "next/link";
import ProductTable from "@/components/admin/product-table";
import {
  adminProductImage,
  isWooCommerceConfigured,
  listAdminCategories,
  listAdminProducts,
  type AdminProductRecord,
} from "@/lib/woocommerce";

export const dynamic = "force-dynamic";

function toRow(p: AdminProductRecord) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    active: p.active,
    image: adminProductImage(p),
  };
}

export default async function AdminProductsPage() {
  let products: AdminProductRecord[] = [];
  let configuredCategories: string[] = [];
  let loadError = false;
  const wooMode = isWooCommerceConfigured();

  try {
    products = await listAdminProducts();
    configuredCategories = await listAdminCategories();
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
          Não foi possível carregar os produtos.{" "}
          {wooMode
            ? "Verifique as chaves da API WooCommerce nas variáveis WOOCOMMERCE_*."
            : "Verifique a conexão com o banco em /api/health."}
        </p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nenhum produto cadastrado ainda.</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-neutral-500">
            Produtos agrupados por categoria.
            {wooMode
              ? " A ordenação manual fica desativada quando o painel está conectado ao WooCommerce."
              : (
                  <>
                    {" "}Arraste pelo ícone <span className="font-medium">⠿</span> ou use as setas
                    para reordenar dentro de cada grupo.
                  </>
                )}
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
                <ProductTable compact products={group.products.map(toRow)} reorderable={!wooMode} />
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
