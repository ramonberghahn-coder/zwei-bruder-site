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
- Prisma + PostgreSQL (Neon)

## Como rodar

1. Instale Node.js LTS (incluindo npm) e Git no Windows.
2. Crie o arquivo `.env` baseado no `.env.example`.
3. Instale dependências:

```bash
npm install
```

4. Configure `DATABASE_URL` no `.env` (Neon/Postgres).

5. Gere banco e seed:

```bash
npm run db:push
npm run db:seed
```

6. Rode em desenvolvimento:

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

- O upload de comprovante é salvo em `public/uploads`.
- Configure `NEXT_PUBLIC_SITE_URL` corretamente em produção para que o link do comprovante chegue completo no WhatsApp.

## Deploy na Render (GitHub)

1. Faça push deste projeto para um repositório no GitHub.
2. Na Render, clique em **New +** -> **Blueprint**.
3. Conecte o repositório e selecione a branch principal.
4. Crie um banco gratuito no Neon e copie a connection string **direct** (`postgresql://...` **sem** `-pooler` no host).
5. Em **Environment**, configure:
   - `DATABASE_URL` = connection string direct do Neon (obrigatório)
   - `NEXT_PUBLIC_SITE_URL=https://SEU-DOMINIO.onrender.com`
   - `ADMIN_PASSWORD` com uma senha forte para o painel
   - `SESSION_SECRET` (já pode ser gerada automaticamente)
6. Rode o primeiro deploy.

7. Após ficar **Live**, abra uma vez no navegador:

`https://SEU-SITE.onrender.com/api/setup?token=SUA_ADMIN_PASSWORD`

Isso cria as tabelas no Neon e carrega os dados iniciais.

> O build não depende mais do banco (evita falha de deploy). A configuração do banco é feita nesse passo único.
