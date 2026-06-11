"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteProductButton from "@/components/admin/delete-product-button";
import { adminFetch, readAdminError } from "@/lib/admin-fetch";
import { formatCurrency, productImageUrl } from "@/lib/utils";

export type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  image: string;
};

export default function ProductTable({
  products,
  compact = false,
  reorderable = true,
}: {
  products: ProductRow[];
  compact?: boolean;
  reorderable?: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<ProductRow[]>(products);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function persist(ordered: ProductRow[]) {
    if (!reorderable) return;
    setSaving(true);
    const res = await adminFetch(`/api/admin/products/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ordered.map((r) => r.id) }),
    });
    if (!res.ok) {
      alert(await readAdminError(res));
      setRows(products);
      setSaving(false);
      return;
    }
    setSaving(false);
    router.refresh();
  }

  function reorder(from: number, to: number) {
    if (!reorderable) return;
    if (from === to || to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next);
    persist(next);
  }

  function handleDrop(target: number) {
    if (dragIndex === null) return;
    reorder(dragIndex, target);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <>
      {!compact && reorderable ? (
        <p className="mt-6 text-sm text-neutral-500">
          Arraste as linhas (pelo ícone <span className="font-medium">⠿</span>) para reordenar, ou use
          as setas. A ordem é aplicada na loja automaticamente.
        </p>
      ) : null}
      <div
        className={`overflow-auto border border-neutral-200 bg-white ${compact ? "mt-4" : "mt-4"}`}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left uppercase tracking-wider text-neutral-600">
            <tr>
              {reorderable ? <th className="px-4 py-3">Ordem</th> : null}
              <th className="px-4 py-3">Imagem</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr
                key={p.id}
                draggable={reorderable}
                onDragStart={() => setDragIndex(i)}
                onDragEnter={() => setOverIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={`border-t border-neutral-200 ${
                  dragIndex === i ? "opacity-50" : ""
                } ${overIndex === i && dragIndex !== i ? "bg-blue-50" : ""}`}
              >
                {reorderable ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="cursor-grab select-none text-lg leading-none text-neutral-400"
                        title="Arraste para reordenar"
                      >
                        ⠿
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => reorder(i, i - 1)}
                          disabled={saving || i === 0}
                          aria-label="Mover para cima"
                          title="Mover para cima"
                          className="flex h-5 w-5 items-center justify-center rounded border border-neutral-300 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => reorder(i, i + 1)}
                          disabled={saving || i === rows.length - 1}
                          aria-label="Mover para baixo"
                          title="Mover para baixo"
                          className="flex h-5 w-5 items-center justify-center rounded border border-neutral-300 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImageUrl(p.image)} alt={p.name} className="h-12 w-12 object-cover" />
                </td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={p.active ? "text-green-700" : "text-neutral-400"}>
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      className="text-blue-600 hover:underline"
                      href={`/admin/produtos/${p.id}/editar`}
                    >
                      Editar
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
