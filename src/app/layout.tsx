import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/cart-context";

export const metadata: Metadata = {
  title: "Zwei Brüder",
  description: "Facas e acessórios em couro de alta qualidade",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
