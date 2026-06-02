export type CustomerOrderLine = {
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type CustomerOrderEntry = {
  id: string;
  orderNumber: string;
  status: string;
  deliveryMethod: string | null;
  total: number;
  createdAt: string;
  items: CustomerOrderLine[];
};

export type CustomerExtractEntry = {
  key: string;
  linkedBy: "telefone" | "nome";
  displayName: string;
  displayPhone: string;
  otherNames: string[];
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  orders: CustomerOrderEntry[];
};

export type OrderForExtract = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string | null;
  total: number;
  items: string;
  createdAt: Date;
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "";
  return digits.length > 11 ? digits.slice(-11) : digits;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function customerGroupKey(order: {
  customerName: string;
  customerPhone: string;
}): { key: string; linkedBy: "telefone" | "nome" } {
  const phone = normalizePhone(order.customerPhone);
  if (phone) return { key: `phone:${phone}`, linkedBy: "telefone" };
  const name = normalizeName(order.customerName);
  return { key: `name:${name}`, linkedBy: "nome" };
}

function parseOrderLines(raw: string): CustomerOrderLine[] {
  try {
    const parsed = JSON.parse(raw) as Array<{
      name?: string;
      quantity?: number;
      price?: number;
    }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const quantity = item.quantity ?? 1;
      const price = item.price ?? 0;
      return {
        name: item.name?.trim() || "Produto",
        quantity,
        price,
        lineTotal: price * quantity,
      };
    });
  } catch {
    return [];
  }
}

function pickDisplayName(names: string[]): string {
  const counts = new Map<string, number>();
  for (const n of names) {
    const trimmed = n.trim();
    if (!trimmed) continue;
    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }
  let best = names[0]?.trim() || "Cliente";
  let bestCount = 0;
  for (const [name, count] of counts) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best;
}

export function buildCustomerExtract(orders: OrderForExtract[]): CustomerExtractEntry[] {
  const groups = new Map<
    string,
    {
      linkedBy: "telefone" | "nome";
      names: string[];
      phones: string[];
      orders: CustomerOrderEntry[];
      totalSpent: number;
      lastOrderAt: Date;
    }
  >();

  for (const order of orders) {
    const { key, linkedBy } = customerGroupKey(order);
    const existing = groups.get(key) ?? {
      linkedBy,
      names: [],
      phones: [],
      orders: [],
      totalSpent: 0,
      lastOrderAt: new Date(0),
    };

    existing.names.push(order.customerName);
    existing.phones.push(order.customerPhone);
    existing.totalSpent += order.total;
    if (order.createdAt > existing.lastOrderAt) {
      existing.lastOrderAt = order.createdAt;
    }

    existing.orders.push({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      deliveryMethod: order.deliveryMethod,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      items: parseOrderLines(order.items),
    });

    groups.set(key, existing);
  }

  const entries: CustomerExtractEntry[] = [];

  for (const [key, group] of groups) {
    const displayName = pickDisplayName(group.names);
    const displayPhone =
      group.phones.map((p) => p.trim()).find((p) => normalizePhone(p)) ||
      group.phones.find((p) => p.trim()) ||
      "—";

    const otherNames = [
      ...new Set(
        group.names.map((n) => n.trim()).filter((n) => n && n !== displayName)
      ),
    ];

    group.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    entries.push({
      key,
      linkedBy: group.linkedBy,
      displayName,
      displayPhone,
      otherNames,
      orderCount: group.orders.length,
      totalSpent: group.totalSpent,
      lastOrderAt: group.lastOrderAt.toISOString(),
      orders: group.orders,
    });
  }

  entries.sort(
    (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
  );

  return entries;
}
