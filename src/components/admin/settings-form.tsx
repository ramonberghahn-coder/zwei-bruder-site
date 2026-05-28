"use client";

import { useState } from "react";
import type { StoreSettings } from "@/lib/settings";

export default function SettingsForm({ initial }: { initial: StoreSettings }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setSaving(true);
    setMessage(null);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMessage(res.ok ? "Configurações salvas." : "Falha ao salvar configurações.");
    setSaving(false);
  }

  return (
    <form action={onSubmit} className="mt-8 max-w-2xl space-y-4 border border-neutral-200 p-6">
      <input className="input" name="storeName" defaultValue={initial.storeName} placeholder="Nome da marca" />
      <input className="input" name="storeTagline" defaultValue={initial.storeTagline} placeholder="Slogan" />
      <input className="input" name="whatsappNumber" defaultValue={initial.whatsappNumber} placeholder="WhatsApp da empresa" />
      <input className="input" name="contactEmail" defaultValue={initial.contactEmail} placeholder="Email de contato" />
      <input className="input" name="pixKey" defaultValue={initial.pixKey} placeholder="Chave PIX" />
      <input className="input" name="pixMerchantName" defaultValue={initial.pixMerchantName} placeholder="Nome recebedor PIX" />
      <input className="input" name="pixMerchantCity" defaultValue={initial.pixMerchantCity} placeholder="Cidade PIX" />
      <textarea className="textarea" rows={4} name="aboutText" defaultValue={initial.aboutText} placeholder="Sobre a marca" />
      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Salvando..." : "Salvar configurações"}
      </button>
      {message && <p className="text-sm text-neutral-700">{message}</p>}
    </form>
  );
}
