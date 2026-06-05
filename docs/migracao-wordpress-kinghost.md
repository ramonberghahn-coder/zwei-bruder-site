# Migração para WordPress/WooCommerce na KingHost

Este caminho abandona o app Next.js atual e recria a loja em WordPress com
WooCommerce. A hospedagem inclusa da KingHost costuma atender WordPress, mas o
site deixa de usar o painel/admin customizado deste repositório.

## 1. Instalar WordPress

No painel da KingHost:

1. Escolha **Criar site com WordPress**.
2. Use o domínio `www.zweibruder.com.br`.
3. Ative SSL/HTTPS para o domínio.
4. Acesse o painel:

```txt
https://www.zweibruder.com.br/wp-admin
```

## 2. Instalar plugins principais

No WordPress, vá em **Plugins → Adicionar novo** e instale:

- **WooCommerce**: produtos, carrinho e checkout.
- Um plugin de PIX para WooCommerce, conforme o gateway desejado.
- Plugin de backup, por exemplo UpdraftPlus ou equivalente.

Opcional:

- Plugin de SMTP para e-mails.
- Plugin de SEO.
- Plugin de cache, se a KingHost recomendar.

## 3. Configurar WooCommerce

Em **WooCommerce → Configurações**:

- Moeda: Real brasileiro (BRL).
- País/loja: Brasil.
- Estoque: ativar gerenciamento de estoque se quiser controlar quantidade.
- Frete: configurar retirada/entrega conforme a operação.
- Pagamentos: configurar PIX.

## 4. Exportar produtos do site atual

Com `DATABASE_URL` apontando para o banco atual, rode:

```bash
npm run wordpress:export-products
```

Isso gera:

```txt
exports/woocommerce-products.csv
```

Para escolher outro caminho:

```bash
npm run wordpress:export-products -- exports/produtos-wordpress.csv
```

O CSV usa colunas do importador nativo do WooCommerce:

- `Type`
- `SKU`
- `Name`
- `Description`
- `Regular price`
- `Stock`
- `Categories`
- `Images`

As URLs em `Images` precisam estar públicas. Se as imagens já estiverem no
Cloudinary, o WooCommerce consegue baixá-las durante a importação.

## 5. Importar produtos no WooCommerce

No WordPress:

1. Acesse **Produtos → Todos os produtos**.
2. Clique em **Importar**.
3. Envie `exports/woocommerce-products.csv`.
4. Confirme o mapeamento das colunas.
5. Execute a importação.

Depois revise:

- Fotos principais e galeria.
- Preços.
- Estoque.
- Categorias.
- Produtos sob encomenda.

## 6. Recriar páginas e identidade visual

O WordPress não reaproveita automaticamente o layout Next.js. Será necessário:

- Escolher um tema.
- Configurar logo, cores e fontes.
- Criar página inicial.
- Criar páginas institucionais.
- Configurar menus, rodapé e links de WhatsApp/Instagram.

## 7. Dados que não migram automaticamente

O exportador atual cobre produtos. Estes itens precisam ser recriados ou
avaliados manualmente:

- Pedidos antigos.
- Configurações da loja.
- PIX/checkout.
- Textos institucionais.
- Usuários/admins.
- Regras de frete e retirada.

## 8. Virada final do domínio

Quando o WordPress estiver revisado:

1. Garanta que `https://www.zweibruder.com.br` abre o WordPress.
2. Teste compra/reserva/pagamento PIX.
3. Teste formulário/WhatsApp/e-mail.
4. Só então desative a loja antiga na Render, se desejar.

## Plano recomendado

Para evitar loja fora do ar:

1. Manter Render funcionando enquanto monta WordPress.
2. Montar WordPress em domínio temporário ou ambiente de teste.
3. Importar produtos e revisar layout.
4. Apontar `www.zweibruder.com.br` para WordPress quando estiver pronto.
