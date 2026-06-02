import { normalizeOrderStatus } from "./order-status";

export type DashboardStats = {
  totalOrders: number;
  awaitingPaymentCount: number;
  awaitingPaymentTotal: number;
  readyCount: number;
  readyTotal: number;
  completedCount: number;
  completedTotal: number;
  confirmedSalesTotal: number;
  completedSalesTotal: number;
};

export type OrderItemLine = {
  productId: string;
  price: number;
  quantity: number;
  unitCost?: number;
};

export type ProductStockLine = {
  id: string;
  price: number;
  costPrice: number;
  stock: number;
};

export type ProfitStats = {
  realizedProfit: number;
  projectedProfit: number;
  stockUnits: number;
  stockRetailValue: number;
};

function isConfirmedSaleStatus(status: string): boolean {
  const s = normalizeOrderStatus(status);
  return (
    s === "ready_pickup" ||
    s === "ready_shipping" ||
    s === "completed_pickup" ||
    s === "completed_shipping"
  );
}

function parseOrderItems(raw: string): OrderItemLine[] {
  try {
    const parsed = JSON.parse(raw) as OrderItemLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lineProfit(
  item: OrderItemLine,
  costByProductId: Map<string, number>
): number {
  const unitCost =
    typeof item.unitCost === "number"
      ? item.unitCost
      : (costByProductId.get(item.productId) ?? 0);
  return (item.price - unitCost) * item.quantity;
}

export function computeDashboardStats(
  orders: { status: string; total: number }[]
): DashboardStats {
  let awaitingPaymentCount = 0;
  let awaitingPaymentTotal = 0;
  let readyCount = 0;
  let readyTotal = 0;
  let completedCount = 0;
  let completedTotal = 0;

  for (const order of orders) {
    const s = normalizeOrderStatus(order.status);
    if (s === "awaiting_payment") {
      awaitingPaymentCount++;
      awaitingPaymentTotal += order.total;
    } else if (s === "ready_pickup" || s === "ready_shipping") {
      readyCount++;
      readyTotal += order.total;
    } else if (s === "completed_pickup" || s === "completed_shipping") {
      completedCount++;
      completedTotal += order.total;
    }
  }

  return {
    totalOrders: orders.length,
    awaitingPaymentCount,
    awaitingPaymentTotal,
    readyCount,
    readyTotal,
    completedCount,
    completedTotal,
    confirmedSalesTotal: readyTotal + completedTotal,
    completedSalesTotal: completedTotal,
  };
}

export function computeProfitStats(
  orders: { status: string; items: string }[],
  products: ProductStockLine[]
): ProfitStats {
  const costByProductId = new Map(products.map((p) => [p.id, p.costPrice]));

  let realizedProfit = 0;

  for (const order of orders) {
    if (!isConfirmedSaleStatus(order.status)) continue;
    for (const item of parseOrderItems(order.items)) {
      realizedProfit += lineProfit(item, costByProductId);
    }
  }

  let projectedProfit = 0;
  let stockUnits = 0;
  let stockRetailValue = 0;

  for (const product of products) {
    if (product.stock <= 0) continue;
    stockUnits += product.stock;
    stockRetailValue += product.price * product.stock;
    projectedProfit += (product.price - product.costPrice) * product.stock;
  }

  return {
    realizedProfit,
    projectedProfit,
    stockUnits,
    stockRetailValue,
  };
}
