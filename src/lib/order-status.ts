export type OrderStatus =
  | "awaiting_payment"
  | "ready_pickup"
  | "ready_shipping"
  | "completed_pickup"
  | "completed_shipping";

/** Status antigos ainda gravados no banco. */
const LEGACY_AWAITING = new Set([
  "reserved",
  "waitlist",
  "paid_waiting_confirmation",
]);

export function normalizeOrderStatus(raw: string): OrderStatus {
  if (LEGACY_AWAITING.has(raw)) return "awaiting_payment";
  if (
    raw === "ready_pickup" ||
    raw === "ready_shipping" ||
    raw === "completed_pickup" ||
    raw === "completed_shipping"
  ) {
    return raw;
  }
  return "awaiting_payment";
}

export function isAwaitingPayment(status: string): boolean {
  return normalizeOrderStatus(status) === "awaiting_payment";
}

export function getOrderStatusLabel(
  status: string,
  deliveryMethod?: string | null
): string {
  const s = normalizeOrderStatus(status);
  switch (s) {
    case "awaiting_payment":
      return "Aguardando confirmação de pagamento";
    case "ready_pickup":
      return "Pagamento confirmado — liberado para retirada";
    case "ready_shipping":
      return "Pagamento confirmado — liberado para entrega";
    case "completed_pickup":
      return "Retirado pelo cliente";
    case "completed_shipping":
      return "Entregue";
    default:
      return "Aguardando confirmação de pagamento";
  }
}

export function getOrderStatusBadgeClass(status: string): string {
  const s = normalizeOrderStatus(status);
  switch (s) {
    case "awaiting_payment":
      return "border-amber-300 bg-amber-50 text-amber-900";
    case "ready_pickup":
    case "ready_shipping":
      return "border-green-300 bg-green-50 text-green-800";
    case "completed_pickup":
    case "completed_shipping":
      return "border-neutral-300 bg-neutral-100 text-neutral-600";
    default:
      return "border-neutral-300 bg-neutral-50 text-neutral-600";
  }
}

export function statusAfterPaymentConfirm(
  deliveryMethod?: string | null
): "ready_pickup" | "ready_shipping" {
  return deliveryMethod === "pickup" ? "ready_pickup" : "ready_shipping";
}

export function statusAfterComplete(
  deliveryMethod?: string | null
): "completed_pickup" | "completed_shipping" {
  return deliveryMethod === "pickup" ? "completed_pickup" : "completed_shipping";
}

export function canConfirmPayment(status: string): boolean {
  return isAwaitingPayment(status);
}

export function canMarkComplete(status: string): boolean {
  const s = normalizeOrderStatus(status);
  return s === "ready_pickup" || s === "ready_shipping";
}

export type OrderFilter = "todos" | "aguardando" | "liberados" | "concluidos";

export const ORDER_FILTERS: { id: OrderFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "aguardando", label: "Aguardando pagamento" },
  { id: "liberados", label: "Liberados" },
  { id: "concluidos", label: "Concluídos" },
];

export function parseOrderFilter(value: string | undefined): OrderFilter {
  if (value === "aguardando" || value === "liberados" || value === "concluidos") return value;
  return "todos";
}

export function orderMatchesFilter(status: string, filter: OrderFilter): boolean {
  if (filter === "todos") return true;
  const s = normalizeOrderStatus(status);
  if (filter === "aguardando") return s === "awaiting_payment";
  if (filter === "liberados") return s === "ready_pickup" || s === "ready_shipping";
  if (filter === "concluidos") return s === "completed_pickup" || s === "completed_shipping";
  return true;
}

export function countOrdersByFilter(
  orders: { status: string }[],
  filter: OrderFilter
): number {
  return orders.filter((o) => orderMatchesFilter(o.status, filter)).length;
}
