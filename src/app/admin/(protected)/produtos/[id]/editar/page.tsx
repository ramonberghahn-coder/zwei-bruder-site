import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/product-form";
import { parseImages } from "@/lib/utils";
import { getAdminProduct, listAdminCategories } from "@/lib/woocommerce";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) return notFound();

  let categories: string[] = [];
  try {
    categories = await listAdminCategories();
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
