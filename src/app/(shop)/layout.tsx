import { getSettings } from "@/lib/settings";
import TopBar from "@/components/store/top-bar";
import Header from "@/components/store/header";
import Footer from "@/components/store/footer";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <TopBar settings={settings} />
      <Header settings={settings} />
      <main className="min-h-[40vh]">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
