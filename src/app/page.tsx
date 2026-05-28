import ProductCard from "@/components/store/product-card";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="container py-10">
      <section className="mb-10 rounded-3xl border p-8" style={{ borderColor: "var(--border)", background: "#fbfaf8" }}>
        <p className="text-sm uppercase tracking-wider text-neutral-500">Nova coleção</p>
        <h1 className="mt-2 text-4xl font-semibold">Facas e couro feitos para durar.</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Um e-commerce limpo e objetivo, com foco em materiais premium e acabamento artesanal.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: p.price,
              compareAt: p.compareAt,
              stock: p.stock,
              images: parseImages(p.images),
            }}
          />
        ))}
      </section>
    </div>
  );
}
