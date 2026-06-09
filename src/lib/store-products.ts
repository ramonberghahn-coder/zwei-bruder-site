import { prismaErrorMessage } from "./db-errors";
import { prisma } from "./prisma";

/** Campos usados na vitrine — sem descrição para reduzir tráfego com o Neon. */
export const productCatalogSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  compareAt: true,
  stock: true,
  category: true,
  images: true,
  sortOrder: true,
  featured: true,
} as const;

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  stock: number;
  category: string;
  images: string;
  sortOrder: number;
  featured: boolean;
};

export async function fetchActiveCatalogProducts(): Promise<CatalogProduct[]> {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: productCatalogSelect,
  });
}

export async function fetchActiveCatalogProductsSafe(): Promise<{
  products: CatalogProduct[];
  error: string | null;
}> {
  try {
    const products = await fetchActiveCatalogProducts();
    return { products, error: null };
  } catch (error) {
    return { products: [], error: prismaErrorMessage(error) };
  }
}
