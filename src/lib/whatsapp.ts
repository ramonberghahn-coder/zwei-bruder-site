import type { CartItem } from "@/types/cart";
import { formatCurrency } from "./utils";

type WhatsAppOrderParams = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  paymentProofUrl?: string | null;
  siteUrl: string;
};

export function buildWhatsAppMessage(params: WhatsAppOrderParams): string {
  const lines = [
    `*Novo pedido — ${params.orderNumber}*`,
    "",
    `*Cliente:* ${params.customerName}`,
    `*Telefone:* ${params.customerPhone}`,
    "",
    "*Itens reservados:*",
    ...params.items.map(
      (i) =>
        `• ${i.quantity}x ${i.name} — ${formatCurrency(i.price * i.quantity)}`
    ),
    "",
    `*Total:* ${formatCurrency(params.total)}`,
    "",
    "Pagamento via PIX. Comprovante no link abaixo (anexe na conversa se necessário).",
  ];

  if (params.paymentProofUrl) {
    const proofUrl = params.paymentProofUrl.startsWith("http")
      ? params.paymentProofUrl
      : `${params.siteUrl}${params.paymentProofUrl}`;
    lines.push("", `*Comprovante:* ${proofUrl}`);
  }

  lines.push("", "_Enviado pelo site Zwei Brüder_");

  return lines.join("\n");
}

export function getWhatsAppWebUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}
