import { prisma } from "./prisma";
import { getCategories } from "./settings";
import { parseImages, productImageUrl } from "./utils";

type WooCategory = {
  id: number;
  name: string;
};

type WooImage = {
  id?: number;
  src?: string;
};

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  regular_price?: string;
  price?: string;
  stock_quantity?: number | null;
  stock_status?: string;
  manage_stock?: boolean;
  status?: string;
  featured?: boolean;
  categories?: WooCategory[];
  images?: WooImage[];
  weight?: string;
  meta_data?: Array<{ key: string; value: unknown }>;
};

export type AdminProductPayload = {
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  category: string;
  stock: number;
  weight?: number;
  featured?: boolean;
  active?: boolean;
  images?: string;
};

export type AdminProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  images: string;
  stock: number;
  weight: number;
  sortOrder: number;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function envValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function isWooCommerceConfigured(): boolean {
  return Boolean(
    envValue("WOOCOMMERCE_URL") &&
      envValue("WOOCOMMERCE_CONSUMER_KEY") &&
      envValue("WOOCOMMERCE_CONSUMER_SECRET")
  );
}

function wooBaseUrl(): string {
  const raw = envValue("WOOCOMMERCE_URL");
  if (!raw) throw new Error("WOOCOMMERCE_URL não configurada.");
  return raw.replace(/\/+$/, "");
}

function wooAuthHeader(): string {
  const key = envValue("WOOCOMMERCE_CONSUMER_KEY");
  const secret = envValue("WOOCOMMERCE_CONSUMER_SECRET");
  if (!key || !secret) {
    throw new Error("Chaves da API WooCommerce não configuradas.");
  }
  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

async function wooFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${wooBaseUrl()}/wp-json/wc/v3${path}`, {
    ...init,
    headers: {
      Authorization: wooAuthHeader(),
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Erro WooCommerce HTTP ${response.status}.`;
    try {
      const data = await response.json();
      if (typeof data?.message === "string") message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

function splitImageLines(value: string | undefined): string[] {
  return (value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.startsWith("http://") || item.startsWith("https://"));
}

function wooProductToAdmin(product: WooProduct): AdminProductRecord {
  const category = product.categories?.[0]?.name || "Sem categoria";
  const images = (product.images || [])
    .map((image) => image.src)
    .filter((src): src is string => Boolean(src));
  const costMeta = product.meta_data?.find((item) => item.key === "_zwei_cost_price")?.value;
  const costPrice =
    typeof costMeta === "number"
      ? costMeta
      : typeof costMeta === "string"
        ? Number(costMeta) || 0
        : 0;
  const weightKg = Number(product.weight || 0);

  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    description: product.description || product.short_description || "",
    price: Number(product.regular_price || product.price || 0),
    costPrice,
    category,
    images: JSON.stringify(images),
    stock: product.stock_quantity ?? 0,
    weight: Number.isFinite(weightKg) ? Math.round(weightKg * 1000) : 500,
    sortOrder: 0,
    featured: Boolean(product.featured),
    active: product.status === "publish",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function ensureWooCategory(name: string): Promise<WooCategory | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const found = await wooFetch<WooCategory[]>(
    `/products/categories?search=${encodeURIComponent(trimmed)}&per_page=100`
  );
  const exact = found.find((category) => category.name.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  return wooFetch<WooCategory>("/products/categories", {
    method: "POST",
    body: JSON.stringify({ name: trimmed }),
  });
}

function wooPayloadFromAdmin(body: AdminProductPayload, category: WooCategory | null) {
  const images = splitImageLines(body.images).map((src) => ({ src }));
  const stock = Math.max(0, Math.trunc(Number(body.stock || 0)));
  const weightGrams = Math.max(0, Number(body.weight ?? 500));

  return {
    name: body.name,
    type: "simple",
    description: body.description,
    short_description: body.description.slice(0, 240),
    regular_price: Number(body.price).toFixed(2),
    manage_stock: true,
    stock_quantity: stock,
    stock_status: stock > 0 ? "instock" : "outofstock",
    status: body.active ?? true ? "publish" : "draft",
    featured: Boolean(body.featured),
    weight: (weightGrams / 1000).toFixed(3),
    categories: category ? [{ id: category.id }] : [],
    images,
    meta_data: [
      {
        key: "_zwei_cost_price",
        value: Number(body.costPrice || 0).toFixed(2),
      },
    ],
  };
}

export async function listAdminProducts(): Promise<AdminProductRecord[]> {
  if (!isWooCommerceConfigured()) {
    return prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  const products = await wooFetch<WooProduct[]>("/products?per_page=100&status=any&orderby=date&order=desc");
  return products.map(wooProductToAdmin);
}

export async function getAdminProduct(id: string): Promise<AdminProductRecord | null> {
  if (!isWooCommerceConfigured()) {
    return prisma.product.findUnique({ where: { id } });
  }

  try {
    const product = await wooFetch<WooProduct>(`/products/${encodeURIComponent(id)}`);
    return wooProductToAdmin(product);
  } catch {
    return null;
  }
}

export async function listAdminCategories(): Promise<string[]> {
  if (!isWooCommerceConfigured()) {
    return getCategories();
  }

  const categories = await wooFetch<WooCategory[]>("/products/categories?per_page=100&orderby=name&order=asc");
  return categories.map((category) => category.name).filter(Boolean);
}

export async function createWooProduct(body: AdminProductPayload): Promise<{ id: string }> {
  const category = await ensureWooCategory(body.category);
  const product = await wooFetch<WooProduct>("/products", {
    method: "POST",
    body: JSON.stringify(wooPayloadFromAdmin(body, category)),
  });
  return { id: String(product.id) };
}

export async function updateWooProduct(id: string, body: AdminProductPayload): Promise<void> {
  const category = await ensureWooCategory(body.category);
  await wooFetch<WooProduct>(`/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(wooPayloadFromAdmin(body, category)),
  });
}

export async function deleteWooProduct(id: string): Promise<void> {
  await wooFetch(`/products/${encodeURIComponent(id)}?force=true`, {
    method: "DELETE",
  });
}

export function adminProductImage(product: AdminProductRecord): string {
  return productImageUrl(parseImages(product.images)[0]);
}
