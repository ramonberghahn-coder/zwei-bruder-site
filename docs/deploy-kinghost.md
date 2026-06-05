# Deploy na KingHost

Este projeto pode rodar na KingHost se o plano contratado tiver suporte a
**Node.js**. O banco pode continuar no Supabase e as imagens no Cloudinary.

## Requisitos

- Plano KingHost com aplicação Node.js.
- Node.js 20 ou 22, se o painel permitir escolher a versão.
- Banco Postgres externo. Recomendado: Supabase Free com URL de
  **Connection pooling**.
- Cloudinary configurado para upload das imagens.

> Planos com pouca memória podem ficar apertados para `next build`. Se o build
> falhar por memória no servidor, rode o build localmente/CI ou use um plano com
> mais memória.

## Variáveis de ambiente

Configure estas variáveis no painel/ambiente da KingHost:

```txt
DATABASE_URL=postgresql://postgres.PROJECT_REF:SENHA@aws-REGION.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
NEXT_PUBLIC_SITE_URL=https://SEU-DOMINIO
ADMIN_PASSWORD=SUA_SENHA_ADMIN
SESSION_SECRET=UMA_STRING_FORTE_COM_PELO_MENOS_32_CARACTERES
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_UPLOAD_PRESET=seu_preset_unsigned
CLOUDINARY_UPLOAD_FOLDER=zwei-bruder-store
```

Observações:

- Para Supabase, prefira a URL **Connection pooling**. Se usar porta `6543`,
  mantenha `pgbouncer=true`.
- Não use a URL direta `db.PROJECT_REF.supabase.co:5432` se ela falhar no host.
- `DIRECT_DATABASE_URL` é opcional neste projeto.

## Comandos

Na pasta do projeto, instale e gere o build:

```bash
npm install
npm run build
```

Para iniciar manualmente:

```bash
npm run start:kinghost
```

No painel Node.js da KingHost, use o arquivo de inicialização:

```txt
kinghost-start.js
```

Esse arquivo detecta automaticamente a porta que a KingHost expõe em variáveis
como `PORT_NOME_DO_SCRIPT` e repassa para o `next start`.

## Primeiro setup do banco

Depois que a aplicação estiver online, abra uma vez:

```txt
https://SEU-DOMINIO/api/setup?token=SUA_SENHA_ADMIN
```

A resposta esperada é parecida com:

```json
{
  "ok": true,
  "schema": "updated",
  "seed": "ok",
  "productCount": 3
}
```

Depois confira:

```txt
https://SEU-DOMINIO/api/health
```

## O que continua fora da KingHost

- **Banco:** Supabase/Postgres, configurado em `DATABASE_URL`.
- **Imagens:** Cloudinary, configurado nas variáveis `CLOUDINARY_*`.

Isso evita salvar imagens no servidor da hospedagem e reduz risco de perder
arquivos em reinícios/deploys.
