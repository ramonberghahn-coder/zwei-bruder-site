import { notFound } from "next/navigation";
import ProductDetails from "@/components/store/product-details";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { parseImages, productImageUrl } from "@/lib/utils";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findUnique({ where: { slug } });
  } catch {
    product = null;
  }

  if (!product || !product.active) return notFound();

  const settings = await getSettings();

  return (
    <ProductDetails
      whatsappNumber={settings.whatsappNumber}
      product={{
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: parseImages(product.images).map((url) => productImageUrl(url)),
      }}
    />
  );
}
