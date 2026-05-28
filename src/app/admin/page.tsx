import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [products, orders] = await Promise.all([prisma.product.count(), prisma.order.count()]);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="border border-neutral-200 p-5">
          <p className="text-sm text-neutral-500">Produtos</p>
          <p className="mt-1 text-3xl font-medium">{products}</p>
        </div>
        <div className="border border-neutral-200 p-5">
          <p className="text-sm text-neutral-500">Pedidos</p>
          <p className="mt-1 text-3xl font-medium">{orders}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/produtos" className="btn btn-primary">
          Gerenciar produtos
        </Link>
        <Link href="/admin/pedidos" className="btn btn-secondary">
          Ver pedidos
        </Link>
        <Link href="/admin/configuracoes" className="btn btn-secondary">
          Configurações da loja
        </Link>
      </div>
    </div>
  );
}
