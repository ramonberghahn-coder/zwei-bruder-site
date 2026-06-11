"use client";

import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/base-path";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch(withBasePath("/api/admin/logout"), { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-secondary !py-2.5 !px-4" onClick={logout}>
      Sair
    </button>
  );
}
