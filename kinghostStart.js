const http = require("http");
const { parse } = require("url");
const next = require("next");

// PM2 da KingHost pode iniciar o script fora da pasta do projeto.
process.chdir(__dirname);

function resolvePort() {
  if (process.env.PORT) return Number(process.env.PORT);

  const kingHostPortEntry = Object.entries(process.env).find(([key, value]) => {
    return key.startsWith("PORT_") && value;
  });

  return Number(kingHostPortEntry?.[1] || 3000);
}

const port = resolvePort();
const hostname = process.env.HOSTNAME || process.env.HOST || "0.0.0.0";

process.env.PORT = String(port);
process.env.NODE_ENV = process.env.NODE_ENV || "production";

console.log(`[kinghostStart] cwd=${process.cwd()} port=${port} host=${hostname}`);

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        handle(req, res, parse(req.url, true));
      })
      .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  })
  .catch((err) => {
    console.error("[kinghostStart] failed to start", err);
    process.exit(1);
  });
