import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";
import { getSettings } from "@/lib/settings";
import Header from "@/components/store/header";
import Footer from "@/components/store/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.storeName} | ${settings.storeTagline}`,
    description: settings.aboutText || settings.storeTagline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const pathname = (await headers()).get("x-pathname") || "";
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          {!isAdminArea ? <Header storeName={settings.storeName} /> : null}
          <main>{children}</main>
          {!isAdminArea ? <Footer settings={settings} /> : null}
        </CartProvider>
      </body>
    </html>
  );
}
