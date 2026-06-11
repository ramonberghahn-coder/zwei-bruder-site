import type { BotSettings } from "./db";
import {
  findOrderByNumber,
  findRecentOrdersByPhone,
  formatOrderSummary,
  isAwaitingPayment,
} from "./db";
import { getChatState, resetChat, setChatStep } from "./chat-state";

const MENU_TRIGGERS = new Set([
  "menu",
  "0",
  "voltar",
  "inicio",
  "início",
  "oi",
  "ola",
  "olá",
  "bom dia",
  "boa tarde",
  "boa noite",
  "hey",
  "hi",
  "hello",
]);

function normalizeInput(text: string): string {
  return text.trim().toLowerCase();
}

export function buildMainMenu(settings: BotSettings): string {
  return [
    `*${settings.storeName}*`,
    settings.storeTagline,
    "",
    "Como posso ajudar?",
    "",
    "1 — Ver catálogo online",
    "2 — Status do pedido",
    "3 — Falar com atendente",
    "4 — Sobre a loja",
    "",
    "Digite o número da opção ou *menu* a qualquer momento.",
  ].join("\n");
}

function buildAboutMessage(settings: BotSettings): string {
  const about =
    settings.aboutText.trim() ||
    "Artesanato em aço e couro. Cada peça é pensada para durar.";
  return [
    `*Sobre ${settings.storeName}*`,
    "",
    about,
    "",
    `Catálogo: ${settings.siteUrl}`,
  ].join("\n");
}

async function handleOrderLookup(
  phone: string,
  input: string
): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed) {
    return "Envie o número do pedido (ex.: *ZB250607-1234*) ou digite *menu* para voltar.";
  }

  const byNumber = await findOrderByNumber(trimmed);
  if (byNumber) {
    const summary = formatOrderSummary(byNumber);
    const extra = isAwaitingPayment(byNumber.status)
      ? "\n\nSe já pagou, envie o comprovante aqui que confirmamos em breve."
      : "";
    return `${summary}${extra}\n\nDigite *menu* para outras opções.`;
  }

  const recent = await findRecentOrdersByPhone(phone, 3);
  if (recent.length === 0) {
    return [
      "Não encontrei pedidos com esse número.",
      "",
      "Confira o código no site após a reserva ou digite *menu*.",
    ].join("\n");
  }

  const lines = recent.map((o) => formatOrderSummary(o));
  return [
    "*Seus pedidos recentes:*",
    "",
    ...lines,
    "",
    "Para um pedido específico, envie o código completo (ex.: *ZB250607-1234*).",
    "Digite *menu* para voltar.",
  ].join("\n\n");
}

export async function handleIncomingMessage(params: {
  jid: string;
  phone: string;
  text: string;
  settings: BotSettings;
}): Promise<string | null> {
  const { jid, phone, text, settings } = params;
  const input = normalizeInput(text);
  if (!input) return null;

  const state = getChatState(jid);

  if (state.step === "human") {
    if (MENU_TRIGGERS.has(input) || input === "1" || input === "2" || input === "3" || input === "4") {
      resetChat(jid);
    } else {
      return null;
    }
  }

  if (MENU_TRIGGERS.has(input)) {
    resetChat(jid);
    return buildMainMenu(settings);
  }

  if (state.step === "awaiting_order_number") {
    const reply = await handleOrderLookup(phone, text);
    resetChat(jid);
    return reply;
  }

  switch (input) {
    case "1":
      return [
        `Acesse nosso catálogo:`,
        settings.siteUrl,
        "",
        "Lá você monta o carrinho e gera o PIX para reservar.",
        "",
        "Digite *menu* para outras opções.",
      ].join("\n");

    case "2": {
      const recent = await findRecentOrdersByPhone(phone, 1);
      if (recent.length === 1) {
        const summary = formatOrderSummary(recent[0]);
        const extra = isAwaitingPayment(recent[0].status)
          ? "\n\nSe já pagou, envie o comprovante aqui."
          : "";
        return `${summary}${extra}\n\nOutro pedido? Envie o código ou *menu*.`;
      }

      setChatStep(jid, "awaiting_order_number");
      return [
        "*Status do pedido*",
        "",
        "Envie o número do pedido (ex.: *ZB250607-1234*).",
        "Se preferir, digite *menu* para voltar.",
      ].join("\n");
    }

    case "3":
      setChatStep(jid, "human");
      return [
        "Certo! Um atendente vai responder em breve.",
        "",
        "Enquanto isso, pode enviar sua dúvida aqui.",
        "Digite *menu* quando quiser voltar ao atendimento automático.",
      ].join("\n");

    case "4":
      return buildAboutMessage(settings);

    default:
      return buildMainMenu(settings);
  }
}
