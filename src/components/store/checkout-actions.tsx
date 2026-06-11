"use client";

import Image from "next/image";
import { useState } from "react";
import { withBasePath } from "@/lib/base-path";

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
      const res = await fetch(withBasePath(`/api/orders/${orderNumber}/proof`), {
        method: "POST",
        body: form,
      });
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
    <div className="mt-10 grid gap-8 md:grid-cols-2">
      <section className="border border-neutral-200 p-6">
        <h2 className="text-sm font-medium">Pagamento PIX</h2>
        {qrDataUrl ? (
          <div className="mt-4">
            <Image src={qrDataUrl} alt="QR Code PIX" width={240} height={240} unoptimized />
          </div>
        ) : null}
        <textarea className="textarea mt-4" rows={4} readOnly value={pixPayload} />
      </section>

      <section className="border border-neutral-200 p-6">
        <h2 className="text-sm font-medium">Comprovante</h2>
        <input
          type="file"
          accept="image/*,.pdf"
          className="input mt-4"
          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary mt-4 w-full" disabled={sending} onClick={handleSendWhatsApp}>
          {sending ? "Enviando..." : "Enviar no WhatsApp"}
        </button>
      </section>
    </div>
  );
}
