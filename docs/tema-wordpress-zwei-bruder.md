# Tema WordPress Zwei Bruder

Este repositório inclui um tema WordPress/WooCommerce simples em:

```txt
wordpress/zwei-bruder-theme
```

Ele reproduz a identidade visual do site atual:

- Cabeçalho centralizado com nome da marca.
- Paleta couro/aço.
- Página inicial com hero e vitrine de produtos.
- Estilos básicos para WooCommerce.
- Rodapé institucional.

## Gerar ZIP do tema

Na raiz do projeto:

```bash
cd wordpress
zip -r zwei-bruder-theme.zip zwei-bruder-theme
```

O arquivo gerado será:

```txt
wordpress/zwei-bruder-theme.zip
```

## Instalar no WordPress

No painel WordPress:

1. Acesse **Aparência → Temas**.
2. Clique em **Adicionar novo**.
3. Clique em **Enviar tema**.
4. Envie `zwei-bruder-theme.zip`.
5. Clique em **Instalar agora**.
6. Clique em **Ativar**.

## Configurar a página inicial

O tema tenta criar automaticamente a página `Inicio`, configurar a home estática
e criar menus básicos quando for ativado. Se precisar revisar manualmente:

1. Vá em **Páginas → Adicionar nova**.
2. Crie uma página chamada `Inicio`.
3. Vá em **Configurações → Leitura**.
4. Em **Sua página inicial exibe**, escolha **Uma página estática**.
5. Selecione a página `Inicio`.

O tema usa `front-page.php`, então a home personalizada aparece nessa página.

## Ajustar textos e contatos

No painel WordPress:

1. Acesse **Aparência → Personalizar**.
2. Abra **Zwei Bruder - textos e contato**.
3. Configure:
   - Título da home.
   - Texto da home.
   - Texto do rodapé.
   - Link do WhatsApp.
   - Link do Instagram.
   - E-mail de contato.

O link de WhatsApp pode ser neste formato:

```txt
https://wa.me/5547999999999
```

## Configurar menus

O tema também tenta criar menus automaticamente. Para revisar, acesse
**Aparência → Menus**:

- Menu principal:
  - Loja
  - Contato
- Menu do rodapé:
  - Loja
  - Minha conta
  - Contato

## WooCommerce

Com o WooCommerce ativo, a home mostra automaticamente até 8 produtos visíveis.

Se a loja não aparecer em `/loja/`, confira em:

```txt
WooCommerce → Configurações → Avançado
```

e selecione a página correta para **Loja**.
