import { prisma } from "./prisma";

export type StoreSettings = {
  storeName: string;
  storeTagline: string;
  whatsappNumber: string;
  contactEmail: string;
  pixKey: string;
  pixKeyType: string;
  pixMerchantName: string;
  pixMerchantCity: string;
  aboutText: string;
  instagram: string;
};

const DEFAULTS: StoreSettings = {
  storeName: "Zwei Brüder",
  storeTagline: "Facas e acessórios em couro",
  whatsappNumber: "5511999999999",
  contactEmail: "contato@zweibruder.com.br",
  pixKey: "contato@zweibruder.com.br",
  pixKeyType: "email",
  pixMerchantName: "ZWEI BRUDER",
  pixMerchantCity: "SAO PAULO",
  aboutText: "",
  instagram: "",
};

export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...map } as StoreSettings;
}

export async function updateSettings(
  data: Partial<StoreSettings>
): Promise<StoreSettings> {
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      await prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });
    }
  }
  return getSettings();
}
