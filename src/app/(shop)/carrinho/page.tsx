import CartPage from "@/components/store/cart-page";
import { getSettings } from "@/lib/settings";

export default async function CarrinhoPage() {
  const s = await getSettings();
  return (
    <CartPage
      settings={{
        pickupEnabled: s.pickupEnabled === "true",
        pickupAddress: s.pickupAddress,
        engravingEnabled: s.engravingEnabled === "true",
        engravingPrice1: Number(s.engravingPrice1) || 0,
        engravingPrice2: Number(s.engravingPrice2) || 0,
      }}
    />
  );
}
