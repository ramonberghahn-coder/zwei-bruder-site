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
  pixQrImage: string;
  pixCopyPaste: string;
  pickupEnabled: string;
  pickupAddress: string;
  engravingEnabled: string;
  engravingPrice1: string;
  engravingPrice2: string;
  categories: string;
  aboutText: string;
  instagram: string;
};

export const storeSettingsDefaults: StoreSettings = {
  storeName: "Zwei Brüder",
  storeTagline: "Facas e acessórios em couro",
  whatsappNumber: "5511999999999",
  contactEmail: "zweisbruder@gmail.com",
  pixKey: "zweisbruder@gmail.com",
  pixKeyType: "email",
  pixMerchantName: "ZWEI BRUDER",
  pixMerchantCity: "SAO PAULO",
  pixQrImage: "",
  pixCopyPaste: "",
  pickupEnabled: "false",
  pickupAddress: "",
  engravingEnabled: "false",
  engravingPrice1: "0",
  engravingPrice2: "0",
  categories: "[]",
  aboutText: "",
  instagram: "@zweibruder",
};

export function parseCategories(value: string | undefined | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((v) => String(v).trim()).filter(Boolean);
    }
  } catch {
    // valor antigo separado por vírgula
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export async function getCategories(): Promise<string[]> {
  const settings = await getSettings();
  return parseCategories(settings.categories);
}

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
