import Link from "next/link";
import CustomerExtract from "@/components/admin/customer-extract";
import OrderCard from "@/components/admin/order-card";
import { buildCustomerExtract } from "@/lib/customer-orders";
import {
  countOrdersByFilter,
  ORDER_FILTERS,
  orderMatchesFilter,
  parseOrderFilter,
} from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrdersView = "lista" | "extrato";

function parseOrdersView(value: string | undefined): OrdersView {
  return value === "extrato" ? "extrato" : "lista";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; view?: string }>;
}) {
  const { filtro: filtroParam, view: viewParam } = await searchParams;
  const filtro = parseOrderFilter(filtroParam);
  const view = parseOrdersView(viewParam);

  let orders: Awaited<ReturnType<typeof prisma.order.findMany>> = [];
  try {
    orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    orders = [];
  }

  const visible = orders.filter((o) => orderMatchesFilter(o.status, filtro));
  const customers = buildCustomerExtract(orders);

  const listaHref =
    filtro === "todos" ? "/admin/pedidos" : `/admin/pedidos?filtro=${filtro}`;
  const extratoHref = "/admin/pedidos?view=extrato";

  return (
    <div className="container admin-page">
      <h1 className="text-2xl font-medium">Pedidos</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {view === "lista"
          ? "Confirme o pagamento após conferir o comprovante no WhatsApp. O pedido será liberado para entrega ou retirada conforme a forma escolhida pelo cliente."
          : "Histórico de compras por cliente. Pedidos do mesmo telefone são agrupados; sem telefone válido, pelo nome."}
      </p>

      {orders.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={listaHref}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              view === "lista"
                ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            Lista de pedidos
          </Link>
          <Link
            href={extratoHref}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              view === "extrato"
                ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            Extrato por cliente
            <span
              className={`ml-1.5 ${view === "extrato" ? "text-neutral-700" : "text-neutral-400"}`}
            >
              ({customers.length})
            </span>
          </Link>
        </div>
      ) : null}

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Nenhum pedido ainda.</p>
      ) : view === "extrato" ? (
        <CustomerExtract customers={customers} />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {ORDER_FILTERS.map((f) => {
              const count = countOrdersByFilter(orders, f.id);
              const active = filtro === f.id;
              const href =
                f.id === "todos" ? "/admin/pedidos" : `/admin/pedidos?filtro=${f.id}`;
              return (
                <Link
                  key={f.id}
                  href={href}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    active
                      ? "border-[color:var(--accent)] bg-[#faf6f2] font-medium"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {f.label}
                  <span
                    className={`ml-1.5 ${active ? "text-neutral-700" : "text-neutral-400"}`}
                  >
                    ({count})
                  </span>
                </Link>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <p className="mt-8 text-sm text-neutral-500">Nenhum pedido neste filtro.</p>
          ) : (
            <div className="mt-8 space-y-4">
              {visible.map((order) => (
                <OrderCard
                  key={order.id}
                  order={{
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    deliveryMethod: order.deliveryMethod,
                    shippingService: order.shippingService,
                    engravingInfo: order.engravingInfo,
                    total: order.total,
                    paymentProofUrl: order.paymentProofUrl,
                    whatsappSent: order.whatsappSent,
                    createdAt: order.createdAt.toISOString(),
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
