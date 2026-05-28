"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  orderNumber: string;
  pixPayload: string;
  qrDataUrl: string;
};

export default function CheckoutActions({ orderNumber, pixPayload, qrDataUrl }: Props) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendWhatsApp() {
    if (!proofFile) {
      setError("Selecione o comprovante antes de continuar.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("proof", proofFile);
      const res = await fetch(`/api/orders/${orderNumber}/proof`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar comprovante.");
      window.open(data.whatsappUrl, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <section className="card p-5">
        <h2 className="text-xl font-semibold">1) Pague no PIX</h2>
        {qrDataUrl ? (
          <div className="mt-4">
            <Image src={qrDataUrl} alt="QR Code PIX" width={280} height={280} />
          </div>
        ) : null}
        <p className="mt-3 text-sm text-neutral-600">Se preferir, copie o código PIX:</p>
        <textarea className="textarea mt-2" rows={4} readOnly value={pixPayload} />
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold">2) Envie comprovante e abra WhatsApp</h2>
        <input
          type="file"
          accept="image/*,.pdf"
          className="input mt-4"
          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary mt-4 w-full" disabled={sending} onClick={handleSendWhatsApp}>
          {sending ? "Enviando..." : "Enviar pedido no WhatsApp"}
        </button>
      </section>
    </div>
  );
}
