import {
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
} from "@/lib/order-status";
import type { CustomerExtractEntry } from "@/lib/customer-orders";
import { formatCurrency } from "@/lib/utils";

export default function CustomerExtract({ customers }: { customers: CustomerExtractEntry[] }) {
  if (customers.length === 0) {
    return <p className="mt-8 text-sm text-neutral-500">Nenhum cliente com pedidos ainda.</p>;
  }

  const repeatCustomers = customers.filter((c) => c.orderCount > 1).length;

  return (
    <div className="mt-8">
      <p className="text-sm text-neutral-600">
        {customers.length} cliente{customers.length !== 1 ? "s" : ""} ·{" "}
        {repeatCustomers} com mais de um pedido (vinculados pelo telefone ou, se não houver,
        pelo nome).
      </p>

      <div className="mt-6 space-y-4">
        {customers.map((customer) => (
          <details key={customer.key} className="card group">
            <summary className="cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{customer.displayName}</h2>
                  <p className="mt-1 text-sm text-neutral-600">{customer.displayPhone}</p>
                  {customer.otherNames.length > 0 ? (
                    <p className="mt-1 text-xs text-neutral-500">
                      Também como: {customer.otherNames.join(", ")}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-neutral-500">
                    Vinculado por {customer.linkedBy === "telefone" ? "telefone" : "nome"}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">
                    {customer.orderCount} pedido{customer.orderCount !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-neutral-600">
                    Total: {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Último:{" "}
                    {new Date(customer.lastOrderAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 text-xs text-blue-600 group-open:hidden">
                    Ver extrato ▼
                  </p>
                  <p className="mt-2 hidden text-xs text-blue-600 group-open:block">
                    Ocultar extrato ▲
                  </p>
                </div>
              </div>
            </summary>

            <div className="border-t border-neutral-200 px-5 pb-5">
              <div className="space-y-6 pt-5">
                {customer.orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-neutral-100 bg-neutral-50/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium leading-snug ${getOrderStatusBadgeClass(order.status)}`}
                      >
                        {getOrderStatusLabel(order.status, order.deliveryMethod)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-neutral-600">
                      {order.deliveryMethod === "pickup" ? "Retirada" : "Envio"}
                    </p>

                    {order.items.length > 0 ? (
                      <table className="mt-3 w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                            <th className="pb-2 pr-2">Item</th>
                            <th className="pb-2 pr-2 text-center">Qtd</th>
                            <th className="pb-2 pr-2 text-right">Unit.</th>
                            <th className="pb-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((line, i) => (
                            <tr key={i} className="border-t border-neutral-200/80">
                              <td className="py-2 pr-2">{line.name}</td>
                              <td className="py-2 pr-2 text-center">{line.quantity}</td>
                              <td className="py-2 pr-2 text-right">
                                {formatCurrency(line.price)}
                              </td>
                              <td className="py-2 text-right font-medium">
                                {formatCurrency(line.lineTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="mt-2 text-sm text-neutral-500">Itens não disponíveis.</p>
                    )}

                    <p className="mt-3 text-sm font-semibold">
                      Total do pedido: {formatCurrency(order.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
