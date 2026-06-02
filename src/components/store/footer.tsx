import SocialLinks from "./social-links";
import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer id="contato" className="mt-20 border-t border-[color:var(--border)] bg-[#f7f4f0]">
      <div className="container py-14 md:py-16">
        <div className="flex flex-col items-center text-center">
          <p className="footer-heading">Encontre-nos</p>
          <div className="mt-4 flex flex-col items-center gap-3 text-sm text-neutral-600">
            <SocialLinks
              instagram={settings.instagram}
              whatsappNumber={settings.whatsappNumber}
              showLabels
              iconClassName="h-4 w-4"
            />
            <p>
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-black">
                {settings.contactEmail}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 text-center text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
