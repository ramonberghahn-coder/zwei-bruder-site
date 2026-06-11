# Migrar imagens dos produtos para Cloudinary

As fotos antigas podem estar salvas **dentro do banco** como `data:image/...;base64,...`
(isso consome muita cota do Neon e deixa o site lento). Este guia move tudo para
**URLs HTTPS no Cloudinary** e atualiza o campo `images` de cada produto.

## Quando fazer

- Antes de migrar **Render → KingHost**
- Depois de trocar **Neon → Supabase**
- Quando `/api/health` funciona mas as fotos demoram ou o banco estoura cota

## 1. Criar conta Cloudinary (grátis)

1. [cloudinary.com](https://cloudinary.com) → criar conta.
2. Anote o **Cloud name**.
3. **Settings → Upload → Upload presets** → Add upload preset:
   - **Signing mode:** Unsigned
   - **Folder:** `zwei-bruder-store` (ou outro)
   - Salve o nome do preset.

## 2. Variáveis no `.env` (seu PC)

```txt
DATABASE_URL=postgresql://...   # mesmo banco da loja (Neon, Supabase, etc.)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_UPLOAD_PRESET=seu-preset-unsigned
CLOUDINARY_UPLOAD_FOLDER=zwei-bruder-store
```

Alternativa (upload assinado, sem preset unsigned):

```txt
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 3. Ver o que será migrado (dry-run)

Na pasta do projeto:

```bash
npm install
npm run images:migrate-to-cloudinary -- --dry-run
```

Saída esperada:

- Quantos produtos têm imagens inline
- Lista `[dry-run] Migraria produto "..."`

Se aparecer **0 imagens inline**, as fotos já são URLs — nada a fazer.

## 4. Migrar de verdade

```bash
npm run images:migrate-to-cloudinary
```

O script:

- Lê cada produto no Postgres
- Envia cada `data:image/...` ao Cloudinary
- Grava de volta só a URL (`https://res.cloudinary.com/...`)
- Migra também o QR PIX de backup em `Setting.pixQrImage`, se existir

## 5. Conferir

1. Abra a loja e o painel — fotos dos produtos ok.
2. Edite um produto no admin — imagens devem ser URLs, não “Imagem enviada” gigante.
3. Opcional: rode de novo com `--dry-run` — deve mostrar **0** pendentes.

## 6. Repetir na KingHost

Configure as **mesmas** variáveis `CLOUDINARY_*` no painel Node.js da KingHost.
Novos uploads do painel já vão direto pro Cloudinary.

---

## Opções do script

| Comando | Efeito |
|---------|--------|
| `--dry-run` | Só lista, não altera o banco |
| `--limit=5` | Migra no máximo 5 imagens (teste) |
| `--product=ID` | Só um produto (id do Prisma) |

Exemplo:

```bash
npm run images:migrate-to-cloudinary -- --dry-run --limit=3
npm run images:migrate-to-cloudinary -- --product=clxxx123
```

---

## Problemas comuns

| Erro | Solução |
|------|---------|
| Upload externo não configurado | Falta `CLOUDINARY_CLOUD_NAME` + preset ou API key/secret |
| HTTP 401 Cloudinary | Preset unsigned errado ou upload assinado sem secret |
| Cannot connect to database | `DATABASE_URL` errada ou Neon com cota esgotada — use Supabase |
| Imagem muito grande | Reduza a foto no PC e reenvie pelo painel, ou migre produto a produto |

---

## WordPress em vez de Cloudinary

Se preferir mídia no WordPress (KingHost), configure:

```txt
WOOCOMMERCE_URL=https://www.zweibruder.com.br
WORDPRESS_MEDIA_USER=...
WORDPRESS_MEDIA_APP_PASSWORD=...
```

O **upload novo** do painel usa WordPress. Para migrar imagens **antigas** do banco,
use ainda o script com Cloudinary (mais simples) ou reenvie as fotos manualmente.
