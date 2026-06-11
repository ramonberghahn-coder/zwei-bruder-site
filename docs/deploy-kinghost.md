# Deploy na KingHost (Node.js + imagens no servidor)

Este projeto roda na KingHost com **Node.js**. Por padrão, as fotos enviadas pelo
painel ficam em `public/uploads/` **no próprio servidor** — não precisa Cloudinary
nem copiar imagens antigas.

**Migrando da Render?** Veja:

```txt
docs/migracao-render-kinghost.md
```

## Requisitos

- Plano KingHost com aplicação **Node.js** (20 ou 22).
- Banco Postgres externo (Supabase recomendado).
- SSL/HTTPS no domínio.

> Se `npm run build` falhar por memória no servidor, faça o build no PC e envie
> a pasta `.next` por FTP.

## Variáveis de ambiente

```txt
IMAGE_STORAGE=local
DATABASE_URL=postgresql://postgres.PROJECT_REF:SENHA@....pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
NEXT_PUBLIC_SITE_URL=https://zweibruder.com.br
ADMIN_PASSWORD=SUA_SENHA_ADMIN
SESSION_SECRET=UMA_STRING_FORTE_COM_PELO_MENOS_32_CARACTERES
NODE_ENV=production
# Enquanto testar por http://dominio:PORTA (ex.: :21127):
ADMIN_COOKIE_SECURE=false
```

Remova `ADMIN_COOKIE_SECURE=false` quando `https://dominio` (sem porta) estiver ok.

**Imagens:** com `IMAGE_STORAGE=local` (padrão quando Cloudinary/WordPress não
estão configurados), os uploads vão para:

```txt
public/uploads/products/   → fotos de produto  (/uploads/products/...)
public/uploads/settings/   → QR PIX etc.
```

Mantenha essa pasta no servidor entre deploys (não apague no FTP).

### Modos opcionais de imagem

| `IMAGE_STORAGE` | Onde salva |
|-----------------|------------|
| `local` (padrão) | Disco da KingHost (`public/uploads/`) |
| `cloudinary` | Cloudinary (precisa `CLOUDINARY_*`) |
| `wordpress` | Mídia WordPress (precisa `WORDPRESS_MEDIA_*`) |

## Painel Node.js

1. Script de inicialização: **`kinghostStart.js`** (sem `-` ou `_` no nome — exigência da KingHost)
2. Habilite acesso web na **raiz do domínio** (proxy 80/443), se disponível

```bash
npm install
npm run build
npm run start:kinghost
```

## Setup do banco (uma vez)

```txt
https://SEU-DOMINIO/api/setup?token=SUA_SENHA_ADMIN
https://SEU-DOMINIO/api/health
```

Em `/api/health`, confira `"imageStorage": "local"`.

## Produtos sem foto

Cadastre de novo pelo painel ou use **URL externa** no formulário. Não é
necessário migrar imagens da Render.
