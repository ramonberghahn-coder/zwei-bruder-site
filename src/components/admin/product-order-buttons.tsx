"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, readAdminError } from "@/lib/admin-fetch";

export default function ProductOrderButtons({
  id,
  isFirst,
  isLast,
}: {
  id: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function move(direction: "up" | "down") {
    setLoading(true);
    const res = await adminFetch(
      `/api/admin/products/reorder?id=${encodeURIComponent(id)}&direction=${direction}`,
      { method: "POST" }
    );

    if (!res.ok) {
      alert(await readAdminError(res));
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={loading || isFirst}
        aria-label="Mover para cima"
        title="Mover para cima"
        className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={loading || isLast}
        aria-label="Mover para baixo"
        title="Mover para baixo"
        className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ↓
      </button>
    </div>
  );
}
