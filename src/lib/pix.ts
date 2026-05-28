import { createStaticPix, hasError } from "pix-utils";
import QRCode from "qrcode";
import type { StoreSettings } from "./settings";

export function buildPixPayload(
  settings: StoreSettings,
  amount: number,
  orderNumber: string
): string {
  const pix = createStaticPix({
    merchantName: settings.pixMerchantName.slice(0, 25),
    merchantCity: settings.pixMerchantCity.slice(0, 15),
    pixKey: settings.pixKey,
    infoAdicional: `Pedido ${orderNumber}`.slice(0, 72),
    transactionAmount: amount,
  });

  if (hasError(pix)) {
    throw new Error("Não foi possível gerar o código PIX. Verifique as configurações.");
  }

  return pix.toBRCode();
}

export async function generatePixQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 280,
    margin: 2,
    color: { dark: "#1a1a1a", light: "#f7f5f2" },
  });
}
