import Link from "next/link";
import ProductCard from "@/components/store/product-card";
import { prisma } from "@/lib/prisma";
import { getSettings, parseCategories } from "@/lib/settings";
import { parseImages, productImageUrl } from "@/lib/utils";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let loadError = false;
  try {
    products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    loadError = true;
    products = [];
  }

  const settings = await getSettings();

  // Categorias cadastradas que tenham ao menos um produto ativo.
  const productCategories = new Set(
    products.map((p) => p.category).filter(Boolean)
  );
  const configured = parseCategories(settings.categories);
  const categories = [
    ...configured.filter((c) => productCategories.has(c)),
    ...[...productCategories].filter((c) => !configured.includes(c)),
  ];

  const activeCategory =
    categoria && categories.includes(categoria) ? categoria : null;
  const visibleProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <section id="produtos" className="container page-y">
      {categories.length > 0 ? (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Link
            href="/#produtos"
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              !activeCategory
                ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/?categoria=${encodeURIComponent(c)}#produtos`}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                activeCategory === c
                  ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      ) : null}

      {loadError ? (
        <p className="text-center text-sm text-neutral-500">
          Não foi possível carregar o catálogo agora. Verifique a conexão do banco em
          /api/health e rode /api/setup novamente se o banco estiver sem produtos.
        </p>
      ) : visibleProducts.length === 0 ? (
        <p className="text-center text-sm text-neutral-500">
          {products.length === 0
            ? "Nenhum produto cadastrado ainda."
            : "Nenhum produto nesta categoria."}
        </p>
      ) : (
        <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((p) => (
            <ProductCard
              key={p.id}
              whatsappNumber={settings.whatsappNumber}
              product={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.price,
                compareAt: p.compareAt,
                stock: p.stock,
                images: parseImages(p.images).map((url) => productImageUrl(url)),
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
