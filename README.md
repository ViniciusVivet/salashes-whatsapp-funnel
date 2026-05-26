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

## Agenda e painel administrativo

O projeto agora tem:

- `/agendar` — formulario publico para a cliente solicitar horario.
- `/admin` — painel com login para agenda, clientes, servicos, caixa e gastos.

### Configurar Supabase

1. Crie um projeto gratuito no Supabase.
2. No SQL Editor, execute os arquivos `supabase/migrations/001_scheduler_dashboard.sql` e `supabase/migrations/002_payment_and_editing_fields.sql`.
3. Em Authentication > Users, crie o usuario da Sabrina com e-mail e senha.
4. Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

Depois disso:

```bash
npm run dev
```

Fluxo esperado:

1. A cliente solicita horario em `/agendar`.
2. A Sabrina entra em `/admin`.
3. Ela aprova a solicitacao, que vira agendamento confirmado.
4. Quando marcar o agendamento como `Feito`, ele entra no caixa.
5. Gastos cadastrados entram no calculo de lucro estimado.
