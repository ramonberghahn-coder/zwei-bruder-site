# Zwei Brüder Store

E-commerce para marca de facas e acessórios em couro, com visual limpo inspirado em marcas premium.

## Recursos implementados

- Loja com catálogo de produtos e página de detalhe.
- Carrinho lateral e checkout de reserva.
- Geração de PIX com payload e QR Code.
- Upload de comprovante de pagamento.
- Abertura automática do WhatsApp Web com mensagem do pedido e link do comprovante.
- Painel admin para:
  - Cadastrar e editar produtos.
  - Visualizar pedidos e comprovantes.
  - Atualizar configurações da loja (chave PIX, WhatsApp, nome da marca etc).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Neon ou outro Postgres)
- Cloudinary para armazenamento externo de imagens

## Como rodar

1. Instale Node.js LTS (incluindo npm) e Git no Windows.
2. Crie o arquivo `.env` baseado no `.env.example`.
3. Instale dependências:

```bash
npm install
```

4. Configure `DATABASE_URL` no `.env` (Neon/Postgres).

5. Configure o Cloudinary para upload das imagens:

   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_UPLOAD_PRESET` com um preset unsigned
   - `CLOUDINARY_UPLOAD_FOLDER` opcional (padrão sugerido: `zwei-bruder-store`)

   Alternativamente, use upload assinado com `CLOUDINARY_API_KEY` e
   `CLOUDINARY_API_SECRET` no lugar do preset unsigned.

6. Gere banco e seed:

```bash
npm run db:push
npm run db:seed
```

7. Rode em desenvolvimento:

```bash
npm run dev
```

Abra http://localhost:3000.

## Fluxo de compra

1. Cliente adiciona produtos no carrinho.
2. Em checkout, preenche dados e reserva.
3. Sistema gera pedido + código PIX + QR Code.
4. Cliente paga, envia comprovante.
5. Site abre WhatsApp Web com o texto do pedido para o número da empresa.

## Observações

- Os uploads de imagens do painel admin são enviados ao Cloudinary e o banco salva
  apenas a URL HTTPS. Isso evita guardar base64/imagem dentro do Neon.
- Se a loja aparecer sem produtos, abra `/api/health` e confira `productCount`
  e `activeProductCount`. Se `productCount` estiver `0`, rode novamente
  `/api/setup?token=SUA_ADMIN_PASSWORD` depois do deploy.
- Se o Neon retornar `HTTP status 402` / `exceeded the data transfer quota`, o
  projeto passou da cota do plano grátis. Nesse caso, o app não consegue criar
  tabelas nem ler produtos nesse projeto até a cota resetar ou o plano ser
  atualizado. Como alternativa grátis, crie um Postgres em outro provedor (por
  exemplo Supabase Free), troque `DATABASE_URL` na Render para a nova connection
  string, faça Manual Deploy e rode `/api/setup?token=SUA_ADMIN_PASSWORD`.
- No Supabase, se a URL direta `db.<projeto>.supabase.co:5432` falhar na Render,
  use **Project Settings → Database → Connection string → Connection pooling** e
  copie a URL **Session pooler** ou **Transaction pooler**. Ela normalmente usa
  host `...pooler.supabase.com` e funciona melhor em hosts como a Render.
- Se usar a URL **Transaction pooler** do Supabase na porta `6543`, adicione
  `?pgbouncer=true` ao final (ou `&pgbouncer=true` se a URL já tiver `?`).
  O app também normaliza isso automaticamente para o Prisma em runtime.
- Para migrar imagens antigas que ainda estejam salvas como `data:image/...` no
  banco, configure as variáveis do Cloudinary e rode:

```bash
npm run images:migrate-to-cloudinary -- --dry-run
npm run images:migrate-to-cloudinary
```

- O upload de comprovante é salvo em `public/uploads`.
- Configure `NEXT_PUBLIC_SITE_URL` corretamente em produção para que o link do comprovante chegue completo no WhatsApp.

## Deploy na Render (GitHub)

1. Faça push deste projeto para um repositório no GitHub.
2. Na Render, clique em **New +** -> **Blueprint**.
3. Conecte o repositório e selecione a branch principal.
4. Crie um banco gratuito no Neon e copie a connection string do Postgres. A URL
   com `-pooler` pode ser usada em `DATABASE_URL`.
5. Em **Environment**, configure:
   - `DATABASE_URL` = connection string do Neon/Postgres (obrigatório)
   - `DIRECT_DATABASE_URL` = connection string Direct do Neon, sem `-pooler` (opcional)
   - `NEXT_PUBLIC_SITE_URL=https://SEU-DOMINIO.onrender.com`
   - `ADMIN_PASSWORD` com uma senha forte para o painel
   - `SESSION_SECRET` (já pode ser gerada automaticamente)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_UPLOAD_PRESET`
   - `CLOUDINARY_UPLOAD_FOLDER=zwei-bruder-store`
6. Rode o primeiro deploy.

7. Após ficar **Live**, abra uma vez no navegador:

`https://SEU-SITE.onrender.com/api/setup?token=SUA_ADMIN_PASSWORD`

Isso cria as tabelas e carrega os dados iniciais. No Neon, o setup usa o driver
HTTP; em outros Postgres, usa conexão normal via Prisma.

8. Se já existirem imagens antigas gravadas no Neon como base64, rode a migração
   uma vez com as variáveis do Cloudinary configuradas:

```bash
npm run images:migrate-to-cloudinary
```

> O build não depende mais do banco (evita falha de deploy). A configuração do banco é feita nesse passo único.

## Deploy na KingHost

Para hospedar o app em um plano Node.js da KingHost, veja o guia:

```txt
docs/deploy-kinghost.md
```

## Migração para WordPress/WooCommerce

Se a ideia for usar a hospedagem WordPress da KingHost em vez do app Next.js,
veja o guia:

```txt
docs/migracao-wordpress-kinghost.md
```

O tema WordPress/WooCommerce da marca fica em:

```txt
wordpress/zwei-bruder-theme
```

Instruções de instalação:

```txt
docs/tema-wordpress-zwei-bruder.md
```

Para exportar produtos atuais em CSV compatível com WooCommerce:

```bash
npm run wordpress:export-products
```
