"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, readAdminError } from "@/lib/admin-fetch";

type ProductPayload = {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  stock: number;
  weight: number;
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

const MAX_PRODUCT_IMAGES = 12;

function imageLabel(url: string): string {
  if (url.startsWith("data:")) return "Imagem enviada";
  return url.length > 40 ? `${url.slice(0, 40)}…` : url;
}

export default function ProductForm({
  initial,
  endpoint,
  categories = [],
}: {
  initial?: Partial<ProductPayload>;
  endpoint: string;
  categories?: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(splitImages(initial?.images));
  const [urlInput, setUrlInput] = useState("");

  function addImage(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed) return false;
    let added = false;
    setImages((prev) => {
      if (prev.includes(trimmed) || prev.length >= MAX_PRODUCT_IMAGES) return prev;
      added = true;
      return [...prev, trimmed];
    });
    return added;
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function makePrimary(index: number) {
    setImages((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function uploadOneFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await adminFetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha no upload da imagem.");
    return data.url as string;
  }

  async function handleUploadFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const slotsLeft = MAX_PRODUCT_IMAGES - images.length;
    if (slotsLeft <= 0) {
      setMessage(`Limite de ${MAX_PRODUCT_IMAGES} fotos por produto.`);
      setIsError(true);
      return;
    }

    const files = Array.from(fileList).slice(0, slotsLeft);
    setUploading(true);
    setMessage(null);
    setIsError(false);

    const uploaded: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      setMessage(
        files.length > 1 ? `Enviando foto ${i + 1} de ${files.length}…` : "Enviando foto…"
      );
      try {
        uploaded.push(await uploadOneFile(files[i]));
      } catch (error) {
        errors.push(
          error instanceof Error ? error.message : `Erro na foto ${i + 1}.`
        );
      }
    }

    let added = 0;
    if (uploaded.length > 0) {
      setImages((prev) => {
        const next = [...prev];
        for (const url of uploaded) {
          if (next.length >= MAX_PRODUCT_IMAGES || next.includes(url)) continue;
          next.push(url);
          added++;
        }
        return next;
      });
    }

    if (added > 0) {
      setMessage(
        added === 1
          ? "1 foto adicionada."
          : `${added} fotos adicionadas.${errors.length ? ` ${errors.length} falhou(aram).` : ""}`
      );
      setIsError(errors.length > 0);
    } else if (errors.length) {
      setMessage(errors[0]);
      setIsError(true);
    }

    setUploading(false);
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
      costPrice: Number(formData.get("costPrice") || 0),
      category: String(formData.get("category") || "").trim(),
      stock: Number(formData.get("stock") || 0),
      weight: Number(formData.get("weight") || 0),
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
      <div>
        <label className="text-xs text-neutral-500">Nome</label>
        <input
          name="name"
          className="input mt-1"
          placeholder="Ex.: Faca Chef 20cm"
          defaultValue={initial?.name}
          required
        />
      </div>
      <div>
        <label className="text-xs text-neutral-500">Descrição</label>
        <textarea
          name="description"
          className="textarea mt-1"
          rows={4}
          placeholder="Mínimo 5 caracteres"
          defaultValue={initial?.description}
          required
          minLength={5}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs text-neutral-500">Preço de venda (R$)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            className="input mt-1"
            placeholder="0,00"
            defaultValue={initial?.price}
            required
          />
        </div>
        <div>
          <label className="text-xs text-neutral-500">Preço de custo (R$)</label>
          <input
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            className="input mt-1"
            placeholder="0,00"
            defaultValue={initial?.costPrice ?? 0}
          />
          <p className="mt-1 text-xs text-neutral-500">Usado no cálculo de lucro do dashboard.</p>
        </div>
        <div>
          <label className="text-xs text-neutral-500">Estoque</label>
          <input
            name="stock"
            type="number"
            min="0"
            className="input mt-1"
            placeholder="0"
            defaultValue={initial?.stock ?? 0}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-neutral-500">Peso para frete (gramas)</label>
        <input
          name="weight"
          type="number"
          min="0"
          step="1"
          className="input mt-1"
          placeholder="Ex.: 500"
          defaultValue={initial?.weight ?? 500}
          required
        />
        <p className="mt-1 text-xs text-neutral-500">
          Usado no cálculo de frete por CEP. Inclua a embalagem (ex.: faca ~500g).
        </p>
      </div>
      <div>
        <label className="text-xs text-neutral-500">Categoria</label>
        {categories.length > 0 ? (
          <>
            <select
              name="category"
              className="input mt-1"
              defaultValue={initial?.category || ""}
              required
            >
              <option value="" disabled>
                Selecione uma categoria
              </option>
              {initial?.category && !categories.includes(initial.category) ? (
                <option value={initial.category}>{initial.category} (atual)</option>
              ) : null}
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Crie novas categorias na aba &quot;Categorias&quot;.
            </p>
          </>
        ) : (
          <input
            name="category"
            className="input mt-1"
            placeholder="Ex.: Facas"
            defaultValue={initial?.category}
            required
          />
        )}
      </div>

      <div className="space-y-3 border border-neutral-200 p-4">
        <p className="text-sm font-medium">Fotos do produto</p>
        <p className="text-xs text-neutral-500">
          Adicione quantas fotos quiser (até {MAX_PRODUCT_IMAGES}). A primeira é a capa na loja;
          as demais aparecem na galeria da página do produto.
        </p>

        {images.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img, index) => (
                <div key={`${img.slice(0, 24)}-${index}`} className="relative border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Imagem ${index + 1}`} className="aspect-square w-full object-cover" />

                  {index === 0 ? (
                    <span className="absolute left-1 top-1 bg-green-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                      Principal
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 bg-black/70 px-2 py-0.5 text-xs text-white hover:bg-black"
                  >
                    Remover
                  </button>

                  <div className="flex items-center justify-between gap-1 px-1 py-1">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="border border-neutral-300 px-1.5 text-xs disabled:opacity-30"
                        aria-label="Mover para a esquerda"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                        className="border border-neutral-300 px-1.5 text-xs disabled:opacity-30"
                        aria-label="Mover para a direita"
                      >
                        →
                      </button>
                    </div>
                    {index !== 0 ? (
                      <button
                        type="button"
                        onClick={() => makePrimary(index)}
                        className="text-[10px] text-blue-600 hover:underline"
                      >
                        Tornar principal
                      </button>
                    ) : null}
                  </div>

                  <span className="block truncate px-1 pb-1 text-[10px] text-neutral-500">
                    {imageLabel(img)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              A primeira imagem (Principal) é a capa exibida na loja. Use as setas ou
              &quot;Tornar principal&quot; para reordenar.
            </p>
          </>
        ) : (
          <p className="text-xs text-neutral-500">Nenhuma imagem adicionada ainda.</p>
        )}

        <div>
          <label className="block text-sm font-medium">
            Enviar fotos (JPG/PNG/WEBP, até 2MB cada)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="input mt-2"
            disabled={uploading || images.length >= MAX_PRODUCT_IMAGES}
            onChange={(e) => {
              handleUploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <p className="mt-1 text-xs text-neutral-600">
            Selecione várias de uma vez ou envie uma por vez. As fotos enviadas ficam no
            armazenamento externo, e o produto salva apenas a URL.
          </p>
          {images.length >= MAX_PRODUCT_IMAGES ? (
            <p className="mt-1 text-xs text-amber-800">Limite de fotos atingido.</p>
          ) : null}
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
              disabled={images.length >= MAX_PRODUCT_IMAGES}
              onClick={() => {
                if (!addImage(urlInput)) {
                  setMessage(
                    images.length >= MAX_PRODUCT_IMAGES
                      ? `Limite de ${MAX_PRODUCT_IMAGES} fotos.`
                      : "URL inválida ou já adicionada."
                  );
                  setIsError(true);
                  return;
                }
                setUrlInput("");
                setMessage("Foto adicionada por URL.");
                setIsError(false);
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
