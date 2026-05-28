"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, readAdminError } from "@/lib/admin-fetch";
import type { StoreSettings } from "@/lib/settings";

export default function SettingsForm({ initial }: { initial: StoreSettings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setIsError(false);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const res = await adminFetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage(await readAdminError(res));
      setIsError(true);
      setSaving(false);
      return;
    }

    setMessage("Configurações salvas. A loja já usa estes dados.");
    setIsError(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-4 border border-neutral-200 p-6">
      <input className="input" name="storeName" defaultValue={initial.storeName} placeholder="Nome da marca" required />
      <input className="input" name="storeTagline" defaultValue={initial.storeTagline} placeholder="Slogan" required />
      <input
        className="input"
        name="whatsappNumber"
        defaultValue={initial.whatsappNumber}
        placeholder="WhatsApp (só números, com DDI: 5511999999999)"
        required
      />
      <input
        className="input"
        name="instagram"
        defaultValue={initial.instagram}
        placeholder="Instagram (@usuario ou URL completa)"
      />
      <input className="input" name="contactEmail" defaultValue={initial.contactEmail} placeholder="Email de contato" required />
      <input className="input" name="pixKey" defaultValue={initial.pixKey} placeholder="Chave PIX" required />
      <input type="hidden" name="pixKeyType" defaultValue={initial.pixKeyType || "email"} />
      <input className="input" name="pixMerchantName" defaultValue={initial.pixMerchantName} placeholder="Nome recebedor PIX" required />
      <input className="input" name="pixMerchantCity" defaultValue={initial.pixMerchantCity} placeholder="Cidade PIX" required />
      <textarea className="textarea" rows={4} name="aboutText" defaultValue={initial.aboutText} placeholder="Sobre a marca" />
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
      {message ? (
        <p className={`text-sm ${isError ? "text-red-600" : "text-green-700"}`}>{message}</p>
      ) : null}
    </form>
  );
}
