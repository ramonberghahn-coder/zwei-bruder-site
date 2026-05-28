"use client";

import { useState } from "react";

type ProductPayload = {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  featured: boolean;
  active: boolean;
  images: string;
};

export default function ProductForm({
  initial,
  endpoint,
}: {
  initial?: Partial<ProductPayload>;
  endpoint: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const payload: ProductPayload = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      price: Number(formData.get("price") || 0),
      category: String(formData.get("category") || ""),
      stock: Number(formData.get("stock") || 0),
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
      images: String(formData.get("images") || ""),
    };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMessage(res.ok ? "Produto salvo com sucesso." : data.error || "Erro ao salvar produto.");
    setLoading(false);
  }

  return (
    <form action={onSubmit} className="card mt-6 space-y-4 p-5">
      <input name="name" className="input" placeholder="Nome" defaultValue={initial?.name} required />
      <textarea
        name="description"
        className="textarea"
        rows={4}
        placeholder="Descrição"
        defaultValue={initial?.description}
        required
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="price" type="number" step="0.01" className="input" defaultValue={initial?.price} required />
        <input name="stock" type="number" className="input" defaultValue={initial?.stock ?? 0} required />
      </div>
      <input name="category" className="input" placeholder="Categoria" defaultValue={initial?.category} required />
      <textarea
        name="images"
        className="textarea"
        rows={3}
        placeholder="URLs de imagens (uma por linha)"
        defaultValue={initial?.images}
      />
      <label className="block text-sm">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured} /> Destaque
      </label>
      <label className="block text-sm">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} /> Ativo
      </label>
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Salvando..." : "Salvar produto"}
      </button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
