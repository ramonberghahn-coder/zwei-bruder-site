"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, readAdminError } from "@/lib/admin-fetch";

export default function CategoriesManager({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>(initial);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function addCategory() {
    const value = input.trim();
    if (!value) return;
    if (categories.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setInput("");
      return;
    }
    setCategories((prev) => [...prev, value]);
    setInput("");
  }

  function removeCategory(index: number) {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setIsError(false);
    const res = await adminFetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
    });
    if (!res.ok) {
      setMessage(await readAdminError(res));
      setIsError(true);
      setSaving(false);
      return;
    }
    setMessage("Categorias salvas.");
    setIsError(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="mt-8 max-w-xl space-y-4 border border-neutral-200 p-6">
      <div>
        <label className="text-xs text-neutral-500">Nova categoria</label>
        <div className="mt-1 flex gap-2">
          <input
            className="input"
            placeholder="Ex.: Facas"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
          />
          <button type="button" className="btn btn-secondary shrink-0" onClick={addCategory}>
            Adicionar
          </button>
        </div>
      </div>

      {categories.length > 0 ? (
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
          {categories.map((c, i) => (
            <li key={`${c}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
              <span>{c}</span>
              <button
                type="button"
                className="text-red-600 hover:underline"
                onClick={() => removeCategory(i)}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">Nenhuma categoria cadastrada ainda.</p>
      )}

      <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? "Salvando..." : "Salvar categorias"}
      </button>
      {message ? (
        <p className={`text-sm ${isError ? "text-red-600" : "text-green-700"}`}>{message}</p>
      ) : null}
    </div>
  );
}
