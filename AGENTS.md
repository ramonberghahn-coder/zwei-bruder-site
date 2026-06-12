# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js (App Router) + TypeScript** e-commerce app (Zwei Brüder
store) using **Prisma + PostgreSQL**. Tailwind for styling. There is also a
WhatsApp bot (`npm run bot`) that runs as a separate process (not part of the
web app). Standard commands live in `package.json` and the README.

### Local database

- Dev uses a **local PostgreSQL** (the production code only switches to the Neon
  serverless adapter when `DATABASE_URL` contains `neon.tech` — see
  `src/lib/database-url.ts`). A plain `postgresql://...@localhost:5432/...` URL
  works with the standard Prisma client.
- PostgreSQL is installed but **not auto-started**. Start it before running the
  app/tests: `sudo pg_ctlcluster 16 main start`.
- A dev `.env` (gitignored) must exist with at least: `DATABASE_URL`,
  `ADMIN_PASSWORD`, `SESSION_SECRET` (32+ chars), `NEXT_PUBLIC_SITE_URL`,
  `IMAGE_STORAGE=local`. After creating/editing the schema run
  `npm run db:push` then `npm run db:seed` (6 demo products + store settings).
- Verify DB connectivity at runtime via `GET /api/health` (returns
  `productCount` and `database: "connected"`).

### Run / build / lint

- Dev server: `npm run dev` (http://localhost:3000).
- Production path used on KingHost: `npm run build` then
  `npm run start:kinghost` (wraps `next start`, honoring `PORT` /
  `PORT_<script>`). Useful to reproduce hosting behavior.
- `npm run lint` (one pre-existing `react-hooks/exhaustive-deps` warning in
  `src/components/store/product-details.tsx`).

### KingHost hosting note (403 on root domain)

The app runs on a **high port (21000–22000)** on KingHost; the root domain
(80/443) needs a reverse proxy to that port. A common production issue is a
**403 on the root domain while the high port works** — caused by a missing proxy
and/or WordPress leftovers in `www/`. The fix (panel "Acesso Web" or an
`.htaccess` reverse proxy with `DirectoryIndex disabled`) is documented in
`docs/dominio-raiz-403-kinghost.md` with a template at
`kinghost/htaccess-raiz-exemplo.txt`.
