import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/session";
import AdminLogoutButton from "@/components/admin/logout-button";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionSafe();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  return (
    <>
      <header className="border-b border-neutral-200">
        <div className="container flex h-14 items-center justify-between">
          <nav className="flex items-center gap-5 text-sm text-neutral-600">
            <Link href="/admin" className="hover:text-black">
              Início
            </Link>
            <Link href="/admin/produtos" className="hover:text-black">
              Produtos
            </Link>
            <Link href="/admin/pedidos" className="hover:text-black">
              Pedidos
            </Link>
            <Link href="/admin/configuracoes" className="hover:text-black">
              Configurações
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-neutral-600 hover:text-black">
              Ver loja
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
