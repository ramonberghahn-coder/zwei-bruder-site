import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/admin-nav";
import AdminLogoutButton from "@/components/admin/logout-button";
import DatabaseBanner from "@/components/admin/database-banner";
import { getSessionSafe } from "@/lib/session";

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
    <div className="min-h-screen bg-[#fafafa]">
      <DatabaseBanner />
      <header className="border-b border-neutral-200 bg-white">
        <div className="container flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <AdminNav />
          <div className="flex items-center gap-2">
            <Link href="/" className="btn btn-secondary !py-2.5 !px-4">
              Ver loja
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
