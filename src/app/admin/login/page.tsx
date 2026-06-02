import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="container page-y text-sm text-neutral-500">Carregando...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
