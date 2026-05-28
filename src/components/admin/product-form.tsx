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
  const [uploading, setUploading] = useState(false);
  const [imagesText, setImagesText] = useState(initial?.images || "");

  async function handleUploadImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload da imagem.");
      setImagesText((prev) => (prev ? `${prev}\n${data.url}` : data.url));
      setMessage("Imagem enviada e adicionada ao produto.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

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
      images: imagesText,
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
    <form action={onSubmit} className="mt-8 max-w-2xl space-y-4 border border-neutral-200 p-6">
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
        value={imagesText}
        onChange={(e) => setImagesText(e.target.value)}
      />
      <div>
        <label className="block text-sm font-medium">Upload de JPG/PNG</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="input mt-2"
          disabled={uploading}
          onChange={(e) => handleUploadImage(e.target.files?.[0] || null)}
        />
        <p className="mt-1 text-xs text-neutral-600">
          O upload gera uma URL local e adiciona automaticamente na lista acima.
        </p>
      </div>
      <label className="block text-sm text-neutral-700">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured} /> Destaque
      </label>
      <label className="block text-sm text-neutral-700">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} /> Ativo
      </label>
      <button className="btn btn-primary" disabled={loading || uploading}>
        {loading ? "Salvando..." : uploading ? "Enviando imagem..." : "Salvar produto"}
      </button>
      {message && <p className="text-sm text-neutral-700">{message}</p>}
    </form>
  );
}
