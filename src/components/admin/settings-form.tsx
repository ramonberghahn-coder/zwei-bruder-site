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
  const [pixQrImage, setPixQrImage] = useState(initial.pixQrImage || "");

  function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setMessage("A imagem do QR Code é muito grande (máx. ~1,5 MB).");
      setIsError(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPixQrImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setIsError(false);

    const formData = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      pixQrImage,
    };

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

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-medium">QR Code do PIX — backup (opcional)</p>
        <p className="mt-1 text-xs text-neutral-500">
          O site gera automaticamente um QR Code <strong>com o valor de cada pedido</strong> a
          partir da sua chave PIX acima. Este QR enviado é apenas um <strong>backup</strong>: ele só
          é usado se a geração automática falhar. Como é um QR fixo do banco, ele não inclui o valor.
        </p>

        {pixQrImage ? (
          <div className="mt-3 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pixQrImage}
              alt="QR Code PIX"
              className="h-28 w-28 rounded border border-neutral-200 bg-white object-contain p-1"
            />
            <button
              type="button"
              className="text-sm text-red-600 hover:underline"
              onClick={() => setPixQrImage("")}
            >
              Remover QR Code
            </button>
          </div>
        ) : null}

        <input
          type="file"
          accept="image/*"
          className="input mt-3 bg-white"
          onChange={handleQrUpload}
        />

        <textarea
          className="textarea mt-3 bg-white"
          rows={3}
          name="pixCopyPaste"
          defaultValue={initial.pixCopyPaste}
          placeholder="Código PIX copia e cola (opcional) — usado junto com o QR enviado"
        />
      </div>

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-medium">Entrega / Retirada</p>
        <p className="mt-1 text-xs text-neutral-500">
          Ative a retirada para o cliente poder escolher buscar o pedido em vez de receber por envio.
        </p>
        <label className="mt-3 block text-xs text-neutral-500">Permitir retirada?</label>
        <select className="input mt-1 bg-white" name="pickupEnabled" defaultValue={initial.pickupEnabled}>
          <option value="false">Não</option>
          <option value="true">Sim</option>
        </select>
        <input
          className="input mt-3 bg-white"
          name="pickupAddress"
          defaultValue={initial.pickupAddress}
          placeholder="Endereço / instruções para retirada"
        />
      </div>

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-medium">Gravação (logo ou nome)</p>
        <p className="mt-1 text-xs text-neutral-500">
          Defina os valores cobrados por gravação. O cliente escolhe no carrinho gravar em 1 ou 2 lados.
        </p>
        <label className="mt-3 block text-xs text-neutral-500">Oferecer gravação?</label>
        <select className="input mt-1 bg-white" name="engravingEnabled" defaultValue={initial.engravingEnabled}>
          <option value="false">Desativado</option>
          <option value="true">Ativado</option>
        </select>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500">Gravação 1 lado (R$)</label>
            <input
              className="input mt-1 bg-white"
              name="engravingPrice1"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initial.engravingPrice1}
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500">Gravação 2 lados (R$)</label>
            <input
              className="input mt-1 bg-white"
              name="engravingPrice2"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initial.engravingPrice2}
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

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
