# IASD Vila Eduardo - Website

Um site moderno e responsivo para a Igreja Adventista do Sétimo Dia (IASD) - Vila Eduardo, desenvolvido com HTML, CSS e JavaScript vanilla.

## 🌟 Recursos Principais

### Interface e Experiência do Usuário
- **Tema Escuro/Claro**: Alternância entre modos claro e escuro com preferência salva localmente
- **Modo Sábado**: Tema especial ativado automaticamente às sextas-feiras após 18h até sábados às 18h
- **Design Responsivo**: Totalmente adaptado para dispositivos móveis e desktop
- **Animações Suaves**: Transições e animações CSS para melhor experiência visual
- **Acessibilidade**: Respeita preferências de movimento reduzido

### Conteúdo Dinâmico
- **Mensagem de Boas-vindas Personalizada**: Saudação conforme hora e dia da semana
- **Verso Bíblico Rotativo**: Exibe versos aleatórios ao carregar a página
- **Links Sociais**: Conexão com Instagram, YouTube, WhatsApp e outras plataformas

### Departamentos
- 🏕️ **Clube de Desbravadores**: Para crianças e adolescentes maiores
- 🎒 **Clube de Aventureiros**: Para crianças menores
- ❤️ **Ação Solidária Adventista (ASA)**: Serviço social e comunitário
- 🤝 **Ministério dos Interessados**: Acompanhamento de visitantes e novos membros

## 📁 Estrutura do Projeto

```
iasd/
├── index.html          # Arquivo principal do site
└── README.md           # Este arquivo
```

## 🚀 Como Usar

1. Abra o arquivo `index.html` em um navegador web
2. O site é totalmente funcional sem necessidade de servidor
3. Todos os links remetem para plataformas externas (redes sociais, WhatsApp, etc.)

## 🎨 Personalizações Disponíveis

### Cores e Temas
As cores principais dos departamentos podem ser modificadas nas variáveis CSS:
- Desbravadores: `#f85d04` (laranja)
- Aventureiros: `#6a04f0` (roxo)
- ASA: `#08ec5f` (verde)
- Interessados: `#e74c3c` (vermelho)

### Versos Bíblicos
Para adicionar novos versos, edite o array `verses` dentro da função `getRandomBibleVerse()` no script

## 📱 Links de Contato

- **Instagram Oficial**: @iasdvilaeduardo
- **Instagram Jovens**: @jovens_ve
- **YouTube**: IASD Vila Eduardo
- **WhatsApp Pastoral**: 85 98701-3938
- **Localização**: Google Maps integrado

## 🌙 Funcionalidades JavaScript

- Detecção automática de tema (escuro/claro/sábado)
- Animações ao scroll (Intersection Observer)
- Efeito ripple em botões ao clicar
- Mensagens dinâmicas baseadas em data/hora
- Armazenamento local de preferências de tema

## 🔧 Compatibilidade

- Chrome/Edge (versão 88+)
- Firefox (versão 85+)
- Safari (versão 14+)
- Navegadores móveis modernos

## 📝 Notas

- O site usa Font Awesome 6.5.0 para ícones
- Todas as imagens são hospedadas no GitHub
- O site é totalmente estático e não requer backend

## 👨‍💻 Desenvolvido para

Igreja Adventista do Sétimo Dia - Vila Eduardo

---

**Última atualização**: janeiro de 2026
