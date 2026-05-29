import type { CartItem } from "@/types/cart";
import { formatCurrency } from "./utils";

type WhatsAppItem = {
  name: string;
  price: number;
  quantity: number;
  waitlistQty?: number;
};

type WhatsAppOrderParams = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: Array<CartItem | WhatsAppItem>;
  subtotal?: number;
  shippingCost?: number;
  shippingService?: string | null;
  shippingCep?: string | null;
  total: number;
  paymentProofUrl?: string | null;
  siteUrl: string;
};

/**
 * Normaliza um telefone para o formato exigido pelo wa.me (DDI + DDD + número).
 * Se vier sem DDI, assume Brasil (55).
 */
export function normalizeWhatsAppNumber(phone: string): string {
  let digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  // remove zeros à esquerda (ex.: 0XX)
  digits = digits.replace(/^0+/, "");
  // já tem DDI Brasil
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  // 10 (fixo) ou 11 (celular) dígitos = DDD + número, sem DDI → adiciona 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function buildWhatsAppMessage(params: WhatsAppOrderParams): string {
  const lines = [
    `*Novo pedido — ${params.orderNumber}*`,
    "",
    `*Cliente:* ${params.customerName}`,
    `*Telefone:* ${params.customerPhone}`,
    "",
    "*Itens:*",
    ...params.items.map((i) => {
      const waitlistQty = "waitlistQty" in i ? i.waitlistQty ?? 0 : 0;
      const suffix = waitlistQty > 0 ? ` (⏳ ${waitlistQty} sob encomenda)` : "";
      return `• ${i.quantity}x ${i.name} — ${formatCurrency(i.price * i.quantity)}${suffix}`;
    }),
  ];

  if (typeof params.subtotal === "number") {
    lines.push("", `*Subtotal:* ${formatCurrency(params.subtotal)}`);
  }

  if (params.shippingCost && params.shippingCost > 0) {
    const svc = params.shippingService ? ` (${params.shippingService})` : "";
    lines.push(`*Frete${svc}:* ${formatCurrency(params.shippingCost)}`);
  }
  if (params.shippingCep) {
    lines.push(`*CEP de entrega:* ${params.shippingCep}`);
  }

  lines.push("", `*Total:* ${formatCurrency(params.total)}`);

  const hasWaitlist = params.items.some(
    (i) => "waitlistQty" in i && (i.waitlistQty ?? 0) > 0
  );
  if (hasWaitlist) {
    lines.push(
      "",
      "Há itens *sob encomenda*. Combinamos o prazo pelo WhatsApp."
    );
  }

  lines.push("", "Pagamento via PIX.");

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
  const digits = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}
