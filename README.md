# Sabrina Lashes — Site Institucional

Site one page da **Sabrina Lashes** (Sabrina Silva — Lash & Brow Designer), focado em conversão para WhatsApp. Atendimento em Ermelino Matarazzo, São Paulo.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse [http://localhost:3000](http://localhost:3000).

## Build e deploy (Vercel)

- Build: `npm run build`
- Start (produção): `npm start`

O projeto está pronto para deploy na Vercel (conectar o repositório e fazer deploy automático).

## Estrutura principal

- `src/app/` — página e layout
- `src/components/` — seções e componentes da página
- `src/data/` — serviços, depoimentos e FAQ
- `src/lib/whatsapp.ts` — número e mensagem padrão do WhatsApp (altere aqui para refletir em todo o site)

## Alterar WhatsApp

Edite `src/lib/whatsapp.ts`: `WHATSAPP_NUMBER` e `DEFAULT_MESSAGE`.
