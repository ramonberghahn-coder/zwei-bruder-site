export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseImages(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string" && u.trim()) : [];
  } catch {
    return [];
  }
}

const FALLBACK_IMAGE = "https://picsum.photos/800/600";

export function productImageUrl(url: string | undefined): string {
  const trimmed = url?.trim();
  if (!trimmed) return FALLBACK_IMAGE;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }
  return FALLBACK_IMAGE;
}

/**
 * Quantidade máxima que pode ser pedida.
 * Estoque <= 0 = sob encomenda, permite até 99.
 */
export function maxOrderQty(stock: number): number {
  return stock > 0 ? stock : 99;
}

export function isWaitlist(stock: number): boolean {
  return stock <= 0;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ZB${y}${m}${d}-${rand}`;
}
