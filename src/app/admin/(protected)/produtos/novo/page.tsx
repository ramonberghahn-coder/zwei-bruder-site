import ProductForm from "@/components/admin/product-form";
import { getCategories } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  let categories: string[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="container admin-page">
      <h1 className="text-2xl font-medium">Novo produto</h1>
      <ProductForm endpoint="/api/admin/products/create" categories={categories} />
    </div>
  );
}
