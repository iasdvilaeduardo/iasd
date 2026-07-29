# IASD Vila Eduardo

Landing page oficial da Igreja Adventista do Sétimo Dia — Vila Eduardo. O projeto é estático, leve e pode ser publicado em qualquer hospedagem que sirva arquivos HTML.

## Estrutura

```
iasd/
├── index.html          # conteúdo, semântica e metadados para busca
├── assets/
│   ├── css/site.css    # identidade visual, responsividade e temas
│   └── js/site.js      # tema, modo sábado, verso e programação
└── imagens locais       # logos dos ministérios e da IASD
```

## Melhorias implementadas

- HTML semântico com link para pular ao conteúdo, foco visível e textos alternativos nas imagens.
- Layout fluido para celular e desktop, com áreas de toque confortáveis e suporte a movimento reduzido.
- Tema claro/escuro, modo sábado e preferência de tema persistente quando o navegador permite.
- Metadados Open Graph, Twitter Card e dados estruturados `Church` para SEO.
- Imagens locais e carregamento preguiçoso nos logos dos departamentos, reduzindo dependências remotas.
- Contador da próxima programação atualizado a cada minuto, sem trabalho desnecessário a cada segundo.

## Uso local

Abra `index.html` no navegador. Não há processo de build, servidor ou dependência de backend.

## Conteúdo a manter atualizado

- Links de contato e redes sociais em `index.html`.
- Horários da programação no bloco `events` em `assets/js/site.js` e na seção de horários do HTML.
- Versos bíblicos nos arrays `regularVerses` e `sabbathVerses` em `assets/js/site.js`.

Antes de publicar, confira se o campo `url` dos dados estruturados no `index.html` corresponde ao endereço público definitivo do site.
