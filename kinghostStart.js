const { spawn } = require("child_process");
const path = require("path");

// PM2 da KingHost pode iniciar o script fora da pasta do projeto.
process.chdir(__dirname);

function resolvePort() {
  if (process.env.PORT) return process.env.PORT;

  const kingHostPortEntry = Object.entries(process.env).find(([key, value]) => {
    return key.startsWith("PORT_") && value;
  });

  return kingHostPortEntry?.[1] || "3000";
}

const port = resolvePort();
process.env.PORT = port;
const hostname = process.env.HOSTNAME || process.env.HOST || "0.0.0.0";

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "start", "-H", hostname, "-p", port], {
  env: process.env,
  stdio: "inherit",
});

function forwardSignal(signal) {
  child.kill(signal);
}

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
