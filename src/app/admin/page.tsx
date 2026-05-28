import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [products, orders] = await Promise.all([prisma.product.count(), prisma.order.count()]);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold">Painel administrativo</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-neutral-600">Produtos cadastrados</p>
          <p className="mt-2 text-2xl font-semibold">{products}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-600">Pedidos</p>
          <p className="mt-2 text-2xl font-semibold">{orders}</p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
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
