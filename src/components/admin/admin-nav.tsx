"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links: { href: string; label: string; exact?: boolean }[] = [
  { href: "/admin", label: "Início", exact: true },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const active = isActive(pathname, link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "btn btn-primary !py-2.5 !px-4" : "btn btn-secondary !py-2.5 !px-4"}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
