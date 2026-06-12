# Erro 403 na raiz do domínio na KingHost (funciona só com a porta)

Sintoma:

- `http://www.zweibruder.com.br/` (sem porta) retorna **403 Forbidden**.
- `http://www.zweibruder.com.br:PORTA/` (com a porta alta da aplicação, ex.: `:21127`)
  abre o site normalmente.

Se é exatamente isso, **a aplicação Node está saudável**. O problema é só o
acesso pela raiz do domínio (portas 80/443).

## Por que acontece

Na KingHost, a aplicação Node escuta numa **porta alta** (faixa 21000–22000),
definida automaticamente pelo painel e exposta no código via
`process.env.PORT_<nome-do-script>` (este projeto resolve isso em
`kinghostStart.js`).

A **raiz do domínio** (portas 80/443) é servida pelo Apache a partir do
*document root* (normalmente a pasta `www/`). Para a raiz chegar até o Node,
precisa existir um **proxy reverso** apontando 80/443 → porta alta.

Quando o site tinha **WordPress**, o `www/` tinha um `index.php` e um
`.htaccess` próprios. Ao remover o WordPress, o `www/` ficou **sem página
inicial e/ou com um `.htaccess` antigo**, e **sem proxy** para o Node. Resultado:
o Apache tenta listar/servir um diretório vazio e responde **403** — enquanto o
acesso direto pela porta alta continua funcionando.

## Solução A (recomendada): habilitar o Acesso Web no painel

A KingHost faz o proxy reverso automaticamente quando você habilita o acesso
web da aplicação.

1. Painel KingHost → selecione o domínio → ícone **Node.JS**.
2. Confirme a aplicação:
   - **Script de inicialização:** `kinghostStart.js`
   - Status **rodando** (gerenciado pelo PM2 do painel).
3. Habilite o **ACESSO WEB (portas 80 e 443)** para a aplicação.
4. Limpe o `www/`: remova sobras do WordPress (`index.php`, pastas `wp-*`,
   `wp-config.php` e o `.htaccess` antigo). Esses arquivos podem continuar
   capturando a raiz e devolvendo 403.
5. Aguarde alguns minutos e teste `https://www.zweibruder.com.br/api/health`.

## Solução B (fallback): proxy reverso via `.htaccess`

Se, mesmo com o acesso web habilitado, a raiz ainda der 403 (por sobras no
`www/`), coloque um `.htaccess` na raiz fazendo o proxy para a porta alta.

1. Descubra a porta alta da aplicação no Painel (ícone Node.JS) ou em
   `~/.bash_node` (variável `$PORT_kinghostStart`).
2. Esvazie o `www/` (sem arquivos do WordPress).
3. Crie o arquivo `www/.htaccess` com o conteúdo de
   [`kinghost/htaccess-raiz-exemplo.txt`](../kinghost/htaccess-raiz-exemplo.txt),
   trocando a porta:

```apache
DirectoryIndex disabled

RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:21127/$1 [P,L]
```

- Troque `21127` pela porta real da sua aplicação.
- `DirectoryIndex disabled` é **obrigatório**: sem ele o Apache converte o
  acesso à home `/` em `/index.html`, e o Next.js responde **404** (as demais
  rotas funcionariam, mas a home não).

## Como verificar

Depois do ajuste, todas as rotas devem responder pela raiz (sem porta):

```txt
https://www.zweibruder.com.br/                 → loja (200)
https://www.zweibruder.com.br/api/health       → {"ok":true,"database":"connected",...}
https://www.zweibruder.com.br/admin/login      → tela de login (200)
```

## Depois que a raiz com HTTPS funcionar

- No `.env`/variáveis da KingHost, remova `ADMIN_COOKIE_SECURE=false` (ele só
  era necessário enquanto o acesso era por `http://dominio:PORTA`).
- Confirme `NEXT_PUBLIC_SITE_URL=https://www.zweibruder.com.br` (sem porta) para
  os links de comprovante/WhatsApp saírem completos.

> Dica: o proxy reverso da KingHost cobre apenas o servidor HTTP da aplicação.
> O bot do WhatsApp (`npm run bot`) continua rodando em processo separado e não
> é exposto pela raiz.
