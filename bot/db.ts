import { PrismaClient } from "@prisma/client";
import {
  getOrderStatusLabel,
  normalizeOrderStatus,
} from "../src/lib/order-status";
import { formatCurrency } from "../src/lib/utils";

const prisma = new PrismaClient();

export type BotSettings = {
  storeName: string;
  storeTagline: string;
  aboutText: string;
  siteUrl: string;
};

const defaults: BotSettings = {
  storeName: "Zwei Brüder",
  storeTagline: "Facas e acessórios em couro",
  aboutText: "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export async function getBotSettings(): Promise<BotSettings> {
  if (!process.env.DATABASE_URL?.trim()) return defaults;

  try {
    const rows = await prisma.setting.findMany({
      where: {
        key: { in: ["storeName", "storeTagline", "aboutText"] },
      },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      ...defaults,
      storeName: map.storeName ?? defaults.storeName,
      storeTagline: map.storeTagline ?? defaults.storeTagline,
      aboutText: map.aboutText ?? defaults.aboutText,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? defaults.siteUrl,
    };
  } catch {
    return defaults;
  }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "";
  return digits.length > 11 ? digits.slice(-11) : digits;
}

export async function findOrderByNumber(orderNumber: string) {
  const normalized = orderNumber.trim().toUpperCase();
  if (!normalized) return null;

  return prisma.order.findFirst({
    where: {
      orderNumber: { equals: normalized, mode: "insensitive" },
    },
  });
}

export async function findRecentOrdersByPhone(phone: string, limit = 3) {
  const target = normalizePhone(phone);
  if (!target) return [];

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  return orders
    .filter((o) => normalizePhone(o.customerPhone) === target)
    .slice(0, limit);
}

export function formatOrderSummary(order: {
  orderNumber: string;
  status: string;
  deliveryMethod: string | null;
  total: number;
  createdAt: Date;
}): string {
  const status = getOrderStatusLabel(order.status, order.deliveryMethod);
  const date = order.createdAt.toLocaleDateString("pt-BR");
  return [
    `*Pedido ${order.orderNumber}*`,
    `Status: ${status}`,
    `Total: ${formatCurrency(order.total)}`,
    `Data: ${date}`,
  ].join("\n");
}

export function isAwaitingPayment(status: string): boolean {
  return normalizeOrderStatus(status) === "awaiting_payment";
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
