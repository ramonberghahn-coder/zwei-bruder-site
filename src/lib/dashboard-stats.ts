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
