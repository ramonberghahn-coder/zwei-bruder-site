# Migração Render → KingHost (Next.js)

Guia para sair da Render e colocar a **mesma loja Next.js** na KingHost.

> **Não confundir** com `docs/migracao-wordpress-kinghost.md` — aquele caminho
> abandona o app Next.js e usa WordPress/WooCommerce.

## Visão geral

| O quê | Onde fica |
|-------|-----------|
| Site + painel admin | KingHost (Node.js) |
| Banco (produtos, pedidos) | Postgres externo — Supabase recomendado |
| **Fotos novas** | Disco da KingHost (`public/uploads/`) |
| Bot WhatsApp (`npm run bot`) | PC/VPS separado — **não** roda na KingHost web |

**Imagens antigas:** não é obrigatório copiar. Produtos sem URL de foto podem ser
reenviados pelo painel na KingHost. URLs externas (`https://...`) continuam
funcionando.

## Antes de desligar a Render

1. Anote: `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
2. Abra `/api/health` na Render — confira `productCount`.
3. Se o Neon estiver com **cota esgotada**, migre o banco para **Supabase** (só
   troca `DATABASE_URL`).

### Opcional: Neon → Supabase

```txt
postgresql://postgres.PROJECT_REF:SENHA@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

Rode `/api/setup?token=...` uma vez com a URL nova.

---

## Passo 1 — Plano KingHost

Hospedagem **Node.js**, Node 20 ou 22, SSL no domínio.

## Passo 2 — App Node no painel

- Script: **`kinghostStart.js`** (sem `-` ou `_` no nome)
- Acesso web (proxy 80/443) se disponível

## Passo 3 — Enviar código

Git do GitHub ou FTP (sem `node_modules`, sem `.env`).

Se faltar memória no build: compile no PC e envie `.next`.

## Passo 4 — Variáveis na KingHost

```txt
IMAGE_STORAGE=local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://zweibruder.com.br
ADMIN_PASSWORD=...
SESSION_SECRET=...
NODE_ENV=production
```

Com `IMAGE_STORAGE=local`, uploads vão para `public/uploads/` no servidor.
**Não apague** essa pasta nos deploys.

Não configure `CLOUDINARY_*` se quiser tudo na KingHost.

## Passo 5 — Build e start

```bash
npm install
npm run build
npm run start:kinghost
```

## Passo 6 — Setup e teste

```txt
/api/setup?token=SUA_SENHA_ADMIN
/api/health          → "imageStorage": "local"
/admin/login
```

Cadastre ou edite produtos e **envie fotos de novo** pelo painel.

## Passo 7 — DNS → KingHost

Aponte o domínio para a KingHost e desligue a Render quando tudo estiver ok.

---

## Checklist

- [ ] Plano Node.js KingHost
- [ ] `kinghostStart.js` no painel
- [ ] `IMAGE_STORAGE=local`
- [ ] Banco acessível (Supabase pooler)
- [ ] `/api/health` ok
- [ ] Upload de foto no painel ok (`/uploads/products/...`)
- [ ] DNS na KingHost
- [ ] Render desligada

Guia técnico: `docs/deploy-kinghost.md`
