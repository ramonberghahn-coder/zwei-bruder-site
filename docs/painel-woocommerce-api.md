# Painel simples via API do WooCommerce

Este projeto pode continuar rodando na Render apenas como painel administrativo
simples, enquanto a loja publica fica no WordPress/WooCommerce da KingHost.

Quando as variáveis `WOOCOMMERCE_*` estão configuradas, as telas em
`/admin/produtos` passam a criar, editar e remover produtos diretamente no
WooCommerce via REST API.

## O que o painel controla

- Nome
- Descrição
- Preço
- Estoque
- Categoria
- Produto ativo/inativo
- Produto em destaque
- Peso
- Fotos por upload ou URL

Se `WORDPRESS_MEDIA_USER` e `WORDPRESS_MEDIA_APP_PASSWORD` estiverem
configurados, os uploads do painel são enviados para a **Biblioteca de Mídia do
WordPress** na KingHost. O WooCommerce recebe a URL pública dessa mídia.

Se essas variáveis não existirem, o painel tenta usar Cloudinary.

## O que ainda fica no WooCommerce/WordPress

- Pedidos
- Checkout
- PIX
- Frete
- Cupons
- Configurações da loja
- Tema/layout

## Criar chaves no WooCommerce

No WordPress:

1. Acesse **WooCommerce → Configurações**.
2. Abra **Avançado**.
3. Abra **REST API**.
4. Clique em **Adicionar chave**.
5. Descrição: `Painel Zwei Bruder`.
6. Usuário: escolha um administrador.
7. Permissões: **Ler/Escrever**.
8. Gere a chave.

Guarde:

- `Consumer key`
- `Consumer secret`

## Criar senha de aplicativo para uploads no WordPress

Para salvar fotos direto na KingHost/WordPress:

1. No WordPress, acesse **Usuários → Perfil**.
2. Role até **Senhas de aplicativo**.
3. Nome da senha: `Painel Zwei Bruder`.
4. Clique em **Adicionar nova senha de aplicativo**.
5. Copie a senha gerada.

Guarde:

- Nome do usuário WordPress.
- Senha de aplicativo gerada.

## Variáveis na Render

No serviço da Render que roda o painel antigo, configure:

```txt
WOOCOMMERCE_URL=https://www.zweibruder.com.br
WOOCOMMERCE_CONSUMER_KEY=ck_...
WOOCOMMERCE_CONSUMER_SECRET=cs_...
WORDPRESS_MEDIA_USER=usuario-admin-wordpress
WORDPRESS_MEDIA_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

Mantenha também:

```txt
ADMIN_PASSWORD=...
SESSION_SECRET=...
```

Cloudinary passa a ser opcional se `WORDPRESS_MEDIA_*` estiver configurado.

Depois faça **Manual Deploy** na Render.

## Usar o painel

Abra:

```txt
https://SEU-PAINEL-RENDER/admin
```

Entre com a senha admin e use:

```txt
Produtos → Novo produto
```

Ao salvar, o produto aparece no WooCommerce/WordPress.

## Observações

- A ordenação manual do painel antigo fica desativada no modo WooCommerce.
- A primeira foto vira a imagem principal do produto no WooCommerce.
- Categorias digitadas no painel são criadas automaticamente no WooCommerce se
  ainda não existirem.
- Remover produto pelo painel remove definitivamente do WooCommerce.
