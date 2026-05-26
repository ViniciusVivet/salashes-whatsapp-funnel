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
2. No SQL Editor, execute os arquivos:
   - `supabase/migrations/001_scheduler_dashboard.sql`
   - `supabase/migrations/002_payment_and_editing_fields.sql`
   - `supabase/migrations/003_lock_admin_to_allowlist.sql`
3. Em Authentication > Users, crie o usuario da Sabrina com e-mail e senha.
4. Copie o `User UID` criado em Authentication > Users e rode:

```sql
insert into public.admin_users (user_id)
values ('COLE_AQUI_O_USER_UID_DA_SABRINA')
on conflict (user_id) do nothing;
```

5. Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

### Checklist de seguranca

- Nao commitar `.env` ou `.env.local`; eles ja estao no `.gitignore`.
- Usar somente a chave `anon public` no frontend. Nunca usar `service_role` no projeto Next.
- Em Supabase > Authentication > Providers, deixe cadastro publico desativado se o painel for usado apenas pela Sabrina.
- Apenas usuarios listados em `public.admin_users` conseguem ler/editar clientes, agenda, caixa e gastos.
- Visitantes anonimos so conseguem ler servicos ativos e criar solicitacoes de horario.
- Depois de alterar variaveis na Vercel, faca redeploy.

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
