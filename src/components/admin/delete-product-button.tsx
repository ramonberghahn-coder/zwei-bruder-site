"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, readAdminError } from "@/lib/admin-fetch";

export default function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Remover o produto "${name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    setLoading(true);
    const res = await adminFetch(`/api/admin/products/delete?id=${encodeURIComponent(id)}`, {
      method: "POST",
    });

    if (!res.ok) {
      alert(await readAdminError(res));
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Removendo..." : "Remover"}
    </button>
  );
}
