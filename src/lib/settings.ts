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

export const storeSettingsDefaults: StoreSettings = {
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

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function getSettings(): Promise<StoreSettings> {
  if (!hasDatabaseUrl()) return storeSettingsDefaults;

  try {
    const rows = await Promise.race([
      prisma.setting.findMany(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("database timeout")), 8_000);
      }),
    ]);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...storeSettingsDefaults, ...map } as StoreSettings;
  } catch {
    return storeSettingsDefaults;
  }
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
