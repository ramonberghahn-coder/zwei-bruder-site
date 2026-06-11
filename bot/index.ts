import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidGroup,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode-terminal";
import path from "path";
import { disconnectDb, getBotSettings } from "./db";
import { handleIncomingMessage } from "./menu";

const AUTH_DIR = path.join(process.cwd(), "bot", "auth");
const logger = pino({ level: "warn" });

function extractPhone(jid: string): string {
  return jid.split("@")[0]?.replace(/\D/g, "") ?? "";
}

function extractText(message: unknown): string | null {
  if (!message || typeof message !== "object") return null;
  const msg = message as {
    conversation?: string;
    extendedTextMessage?: { text?: string };
    buttonsResponseMessage?: { selectedButtonId?: string };
    listResponseMessage?: { singleSelectReply?: { selectedRowId?: string } };
  };

  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.buttonsResponseMessage?.selectedButtonId) {
    return msg.buttonsResponseMessage.selectedButtonId;
  }
  if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) {
    return msg.listResponseMessage.singleSelectReply.selectedRowId;
  }
  return null;
}

async function startBot(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const { version } = await fetchLatestBaileysVersion();

  const connect = async (): Promise<void> => {
    const sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("\nEscaneie o QR Code com o WhatsApp do negócio:\n");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        console.log("Bot conectado ao WhatsApp Web.");
      }

      if (connection === "close") {
        const status = (lastDisconnect?.error as Boom | undefined)?.output
          ?.statusCode;

        if (status === DisconnectReason.loggedOut) {
          console.log(
            "Sessão encerrada. Apague a pasta bot/auth e rode npm run bot de novo."
          );
          void disconnectDb().finally(() => process.exit(0));
          return;
        }

        const reason =
          status === DisconnectReason.restartRequired
            ? "reinício necessário"
            : status === DisconnectReason.timedOut
              ? "timeout"
              : status != null
                ? `código ${status}`
                : "desconhecido";
        const delayMs = status === DisconnectReason.restartRequired ? 0 : 3000;
        console.log(
          `Conexão perdida (${reason}). Reconectando em ${delayMs / 1000}s...`
        );
        setTimeout(() => {
          void connect();
        }, delayMs);
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const jid = msg.key.remoteJid;
        if (!jid || isJidGroup(jid) || jid.endsWith("@broadcast")) continue;

        const text = extractText(msg.message);
        if (!text) continue;

        try {
          const settings = await getBotSettings();
          const reply = await handleIncomingMessage({
            jid,
            phone: extractPhone(jid),
            text,
            settings,
          });

          if (reply) {
            await sock.sendMessage(jid, { text: reply });
          }
        } catch (err) {
          console.error("Erro ao processar mensagem:", err);
        }
      }
    });
  };

  await connect();
}

console.log("Iniciando bot Zwei Brüder (WhatsApp Web)...");
console.log("Mantenha este processo rodando (PC, VPS ou servidor sempre ligado).\n");

startBot().catch((err) => {
  console.error("Erro ao iniciar o bot:", err);
  void disconnectDb().finally(() => process.exit(1));
});

process.on("SIGINT", () => {
  void disconnectDb().finally(() => process.exit(0));
});
