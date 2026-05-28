"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, readAdminError } from "@/lib/admin-fetch";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagesText, setImagesText] = useState(initial?.images || "");

  async function handleUploadImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    setIsError(false);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await adminFetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload da imagem.");
      setImagesText((prev) => (prev ? `${prev}\n${data.url}` : data.url));
      setMessage("Imagem enviada e adicionada ao produto.");
      setIsError(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao enviar imagem.");
      setIsError(true);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    const formData = new FormData(e.currentTarget);
    const payload: ProductPayload = {
      name: String(formData.get("name") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      price: Number(formData.get("price") || 0),
      category: String(formData.get("category") || "").trim(),
      stock: Number(formData.get("stock") || 0),
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
      images: imagesText.trim(),
    };

    const res = await adminFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage(await readAdminError(res));
      setIsError(true);
      setLoading(false);
      return;
    }

    setMessage("Produto salvo. A loja já pode exibir este item.");
    setIsError(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-4 border border-neutral-200 p-6">
      <input name="name" className="input" placeholder="Nome" defaultValue={initial?.name} required />
      <textarea
        name="description"
        className="textarea"
        rows={4}
        placeholder="Descrição (mínimo 5 caracteres)"
        defaultValue={initial?.description}
        required
        minLength={5}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="price" type="number" step="0.01" min="0.01" className="input" defaultValue={initial?.price} required />
        <input name="stock" type="number" min="0" className="input" defaultValue={initial?.stock ?? 0} required />
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
          Na Render Free o arquivo some após reinício do servidor — prefira colar URLs externas.
        </p>
      </div>
      <label className="block text-sm text-neutral-700">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured} /> Destaque
      </label>
      <label className="block text-sm text-neutral-700">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} /> Ativo na loja
      </label>
      <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
        {loading ? "Salvando..." : uploading ? "Enviando imagem..." : "Salvar produto"}
      </button>
      {message ? (
        <p className={`text-sm ${isError ? "text-red-600" : "text-green-700"}`}>{message}</p>
      ) : null}
    </form>
  );
}
