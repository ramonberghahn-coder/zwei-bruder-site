import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/settings";
import { parseImages } from "@/lib/utils";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound();

  let categories: string[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="container admin-page">
      <h1 className="text-2xl font-medium">Editar produto</h1>
      <ProductForm
        endpoint={`/api/admin/products/update?id=${product.id}`}
        categories={categories}
        initial={{
          name: product.name,
          description: product.description,
          price: product.price,
          costPrice: product.costPrice,
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
