import Link from "next/link";
import SocialLinks from "./social-links";
import type { StoreSettings } from "@/lib/settings";

export default function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer id="contato" className="mt-20 border-t border-white/10 bg-[#0c0b0a]">
      <div className="container page-y">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-display text-3xl font-medium text-[#f4f0ea]">{settings.storeName}</p>
            <p className="mt-3 max-w-md whitespace-pre-line text-sm leading-relaxed text-[#9a9288]">
              {settings.aboutText?.trim() ||
                "Facas e acessórios em couro de alta qualidade. Cada peça é pensada para durar, com design limpo e materiais selecionados."}
            </p>
          </div>

          <div className="md:text-right">
            <p className="footer-heading text-[#9a9288]">Encontre-nos</p>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-[#9a9288] md:items-end">
              <SocialLinks
                instagram={settings.instagram}
                whatsappNumber={settings.whatsappNumber}
                showLabels
                iconClassName="h-4 w-4"
              />
              <p>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-[#f4f0ea]">
                  {settings.contactEmail}
                </a>
              </p>
              <Link href="/admin/login" className="btn btn-secondary !py-2.5 !px-4 md:ml-auto">
                Entrar
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-[#6f655c]">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
