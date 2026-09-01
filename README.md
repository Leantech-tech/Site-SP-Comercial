# SP Comercial — Site Institucional

Site institucional responsivo da **SP Comercial — Materiais para Construção**, desenvolvido para apresentar a empresa, seus produtos, diferenciais, localização e canais de atendimento.

## Requisitos atendidos

A proposta comercial previa os seguintes itens para o site institucional:

- ✅ Página inicial
- ✅ Apresentação da empresa
- ✅ Produtos e principais categorias
- ✅ Informações de atendimento
- ✅ Localização
- ✅ Formas de contato
- ✅ Botão direto para atendimento pelo WhatsApp
- ✅ Layout adaptado para computadores, tablets e celulares
- ⚠️ Certificado de segurança HTTPS — depende da configuração do servidor/hospedagem

## Estrutura do site

| Seção | Conteúdo |
|-------|----------|
| Hero | Chamada principal e imagem de destaque |
| Categorias | Principais categorias de produtos |
| Produtos | Vídeo dos produtos disponíveis |
| Sobre | História e diferenciais da empresa |
| Galeria | Imagens da estrutura da loja |
| Por que escolher | Diferenciais da SP Comercial |
| Localização | Endereço, mapa e horário de funcionamento |
| Informações de atendimento | Horário, telefone e canal WhatsApp |
| Contato | CTA final e formas de contato |
| Footer | Contato, endereço e redes sociais |

## Tecnologias

- HTML5 semântico
- CSS3 com variáveis e media queries
- JavaScript vanilla
- Google Fonts
- Google Maps Embed

## Como usar localmente

1. Clone ou baixe o repositório.
2. Abra o arquivo `index.html` em um navegador.
3. Para testar em dispositivos móveis, use um servidor local (ex: `npx serve .` ou extensão Live Server).

## Arquivos principais

```
.
├── index.html          # Estrutura do site
├── css/
│   └── style.css       # Estilos e responsividade
├── js/
│   └── main.js         # Interações (menu, scroll, animações)
├── img/                # Imagens, logotipos e galeria
└── README.md
```

## Certificado de segurança HTTPS

O site já utiliza apenas recursos via **HTTPS** (Google Fonts, Google Maps Embed e links do WhatsApp). Para exibir o cadeado de segurança no navegador, ative o certificado SSL na hospedagem:

- Hospedagens com painel (cPanel, Hostinger, etc.): ative o **SSL gratuito (Let's Encrypt)** com 1 clique.
- VPS / Nginx / Docker: configure o `certbot` ou um reverse proxy com TLS (ex.: Traefik, Nginx com certbot).
- O `Dockerfile` incluso serve o site via Nginx; em produção recomenda-se expor via proxy HTTPS na porta 443.

## Personalizações futuras

Antes de publicar, verifique:

1. **Número do WhatsApp**: substitua `5512997301639` pelo número correto da empresa em todos os links (`header`, `localização`, `CTA` e botão flutuante).
2. **Horário de funcionamento**: ajuste na seção *Localização* (`location__hours`).
3. **Imagens**: substitua as imagens de placeholder pelas fotos reais da loja, se necessário.

## Autoria

Desenvolvido para SP Comercial — Materiais para Construção.
