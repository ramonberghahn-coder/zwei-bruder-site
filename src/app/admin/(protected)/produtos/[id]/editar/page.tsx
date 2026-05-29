import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound();

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-medium">Editar produto</h1>
      <ProductForm
        endpoint={`/api/admin/products/update?id=${product.id}`}
        initial={{
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          weight: product.weight,
          featured: product.featured,
          active: product.active,
          images: parseImages(product.images).join("\n"),
        }}
      />
    </div>
  );
}
