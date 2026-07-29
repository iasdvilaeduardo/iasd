# IASD Vila Eduardo

Portal institucional estático, publicado no GitHub Pages em **https://iasdvilaeduardo.github.io/iasd/**. A hospedagem continua sendo apenas o GitHub Pages; conteúdo, login e imagens são fornecidos pelo Supabase.

## Publicação

Não altere o nome do repositório, a branch `main` nem o endereço acima. Como não há build, basta publicar os arquivos desta pasta no repositório. A URL dos QR Codes permanece a mesma.

## Configuração inicial do Supabase

1. Crie um projeto em [Supabase](https://supabase.com) e, no **SQL Editor**, execute [supabase/schema.sql](supabase/schema.sql).
2. Em **Authentication > URL Configuration**, adicione `https://iasdvilaeduardo.github.io/iasd/` como Site URL e Redirect URL.
3. Em **Authentication > Providers**, deixe o login por e-mail habilitado.
4. Copie a Project URL e a chave **anon/publishable** em `assets/js/config.js`. A chave pública pode ficar no site; nunca use a chave `service_role`.
5. Crie o primeiro usuário em **Authentication > Users** e execute o `update` indicado no fim do SQL para torná-lo `admin`.

O SQL cria as tabelas `events`, `albums`, `photos` e `profiles`, o bucket público `gallery` e as políticas RLS. Visitantes só veem conteúdo publicado; editores administram eventos/álbuns/fotos; administradores também controlam perfis.

## Administração

Acesse `/iasd/admin/`. Administradores e editores podem criar e excluir eventos e álbuns. Para adicionar fotos, use o Storage do Supabase até que o fluxo de upload do painel seja conectado ao projeto configurado; elas devem ser enviadas ao bucket `gallery` e registradas em `photos`.

## Google Analytics

Crie uma propriedade GA4 e preencha `gaMeasurementId` em `assets/js/config.js` com algo como `G-XXXXXXXXXX`. O script só é carregado quando esse valor existe.

## Identidade e conteúdo institucional

- Logos e imagens atuais ficam na raiz do projeto.
- Contatos, departamentos e programação semanal de referência permanecem em `index.html` e `assets/js/site.js`.
- Agenda e galeria são administradas via Supabase depois da configuração.

## Desenvolvimento local

Abra `index.html` ou sirva esta pasta por um servidor estático. Não há Node, Firebase nem backend próprio.

## Segurança

Não comite chaves privadas. `.env` está ignorado. A proteção real está em RLS; teste o painel com uma conta visitante e uma conta de editor antes de publicar conteúdo.
