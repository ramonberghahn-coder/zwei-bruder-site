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

function splitImages(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

function imageLabel(url: string): string {
  if (url.startsWith("data:")) return "Imagem enviada";
  return url.length > 40 ? `${url.slice(0, 40)}…` : url;
}

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
  const [images, setImages] = useState<string[]>(splitImages(initial?.images));
  const [urlInput, setUrlInput] = useState("");

  function addImage(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setImages((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

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
      addImage(data.url);
      setMessage("Imagem adicionada.");
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
      images: images.join("\n"),
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
        <input name="price" type="number" step="0.01" min="0.01" className="input" placeholder="Preço" defaultValue={initial?.price} required />
        <input name="stock" type="number" min="0" className="input" placeholder="Estoque" defaultValue={initial?.stock ?? 0} required />
      </div>
      <input name="category" className="input" placeholder="Categoria" defaultValue={initial?.category} required />

      <div className="space-y-3 border border-neutral-200 p-4">
        <p className="text-sm font-medium">Imagens do produto</p>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img, index) => (
              <div key={`${img.slice(0, 24)}-${index}`} className="relative border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Imagem ${index + 1}`} className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 bg-black/70 px-2 py-0.5 text-xs text-white hover:bg-black"
                >
                  Remover
                </button>
                <span className="block truncate px-1 py-0.5 text-[10px] text-neutral-500">
                  {imageLabel(img)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">Nenhuma imagem adicionada ainda.</p>
        )}

        <div>
          <label className="block text-sm font-medium">Enviar imagem (JPG/PNG/WEBP, até 2MB)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="input mt-2"
            disabled={uploading}
            onChange={(e) => {
              handleUploadImage(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
          <p className="mt-1 text-xs text-neutral-600">
            A imagem é salva junto do produto no banco e fica permanente.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Ou adicionar por URL</label>
          <div className="mt-2 flex gap-2">
            <input
              type="url"
              className="input"
              placeholder="https://..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                addImage(urlInput);
                setUrlInput("");
              }}
            >
              Adicionar
            </button>
          </div>
        </div>
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
