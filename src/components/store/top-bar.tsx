import Link from "next/link";
import SocialLinks from "./social-links";
import type { StoreSettings } from "@/lib/settings";

export default function TopBar({ settings }: { settings: StoreSettings }) {
  return (
    <div className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-[0.14em] text-neutral-600">
      <div className="container flex h-9 items-center justify-between">
        <p className="hidden sm:block">{settings.storeTagline}</p>
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
          <Link href="/admin/login" className="nav-link text-[11px]">
            Entrar
          </Link>
          <SocialLinks
            instagram={settings.instagram}
            whatsappNumber={settings.whatsappNumber}
            iconClassName="h-3.5 w-3.5"
          />
        </div>
      </div>
    </div>
  );
}
