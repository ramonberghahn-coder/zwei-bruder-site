import ProductForm from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold">Novo produto</h1>
      <ProductForm endpoint="/api/admin/products/create" />
    </div>
  );
}
