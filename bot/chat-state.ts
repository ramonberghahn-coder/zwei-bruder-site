export type ChatStep = "menu" | "awaiting_order_number" | "human";

export type ChatState = {
  step: ChatStep;
};

const states = new Map<string, ChatState>();

export function getChatState(jid: string): ChatState {
  return states.get(jid) ?? { step: "menu" };
}

export function setChatStep(jid: string, step: ChatStep): void {
  states.set(jid, { step });
}

export function resetChat(jid: string): void {
  states.set(jid, { step: "menu" });
}
