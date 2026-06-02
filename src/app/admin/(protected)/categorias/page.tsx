import CategoriesManager from "@/components/admin/categories-manager";
import { getCategories } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: string[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-medium">Categorias</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Crie as categorias usadas nos produtos. Elas aparecem como sugestão ao cadastrar um produto.
      </p>
      <CategoriesManager initial={categories} />
    </div>
  );
}
