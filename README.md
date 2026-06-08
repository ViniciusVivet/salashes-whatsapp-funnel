# Sabrina Lashes - Site Institucional

Site one page da **Sabrina Lashes** (Sabrina Silva - Lash & Brow Designer), focado em conversao para WhatsApp. Atendimento na zona leste de SP, em Itaquera.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** para agenda, painel administrativo, feedbacks e storage

## Como rodar localmente

1. Instale as dependencias:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_SITE_URL=
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000).

## Build e deploy

- Build: `npm run build`
- Start em producao: `npm start`

O projeto esta pronto para deploy na Vercel com deploy automatico pelo repositorio.

## Estrutura principal

- `src/app/` - paginas e layout
- `src/components/` - secoes e componentes da pagina
- `src/components/admin/` - dashboard administrativo
- `src/data/` - servicos, depoimentos fallback e FAQ
- `src/lib/whatsapp.ts` - numero e mensagem padrao do WhatsApp
- `src/lib/supabase/client.ts` - client publico do Supabase
- `supabase/migrations/` - SQL necessario para configurar o banco

## Alterar WhatsApp

Edite `src/lib/whatsapp.ts`: `WHATSAPP_NUMBER` e `DEFAULT_MESSAGE`.

## Agenda, feedbacks e painel administrativo

O projeto tem:

- `/agendar` - formulario publico para a cliente solicitar horario.
- `/admin` - painel com login para agenda, clientes, servicos, feedbacks, caixa e gastos.
- Feedbacks publicos com moderacao: cliente envia depoimento, nota, foto de perfil opcional e ate 2 fotos do resultado. A Sabrina aprova no dashboard antes de aparecer no site.

## Configurar Supabase

1. Crie um projeto gratuito no Supabase.
2. No SQL Editor, execute os arquivos nesta ordem:

   - `supabase/migrations/001_scheduler_dashboard.sql`
   - `supabase/migrations/002_payment_and_editing_fields.sql`
   - `supabase/migrations/003_lock_admin_to_allowlist.sql`
   - `supabase/migrations/004_customer_source_tracking.sql`
   - `supabase/migrations/005_feedbacks.sql`

3. Em **Authentication > Users**, crie o usuario da Sabrina com e-mail e senha.
4. Copie o `User UID` criado em **Authentication > Users** e rode:

   ```sql
   insert into public.admin_users (user_id)
   values ('COLE_AQUI_O_USER_UID_DA_SABRINA')
   on conflict (user_id) do nothing;
   ```

5. Configure as variaveis de ambiente na Vercel:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_SITE_URL=
   ```

6. Depois de alterar variaveis na Vercel, faca redeploy.

## Feedbacks

A migration `005_feedbacks.sql` cria:

- tabela `feedbacks`
- tabela `feedback_media`
- bucket publico `feedback-media`
- politicas RLS para envio publico, leitura publica apenas dos aprovados e moderacao somente por admin

Fluxo:

1. A cliente clica em `Deixar meu feedback` na secao `Depoimentos`.
2. Ela envia nome, nota, procedimento, comentario, foto de perfil opcional e ate 2 fotos do resultado.
3. As imagens sao comprimidas no navegador antes do upload.
4. O feedback entra como `pending`.
5. A Sabrina entra em `/admin` > `Feedbacks`.
6. Ela pode aprovar, recusar, destacar, editar ou excluir.
7. Somente feedbacks `approved` aparecem no site.

## Checklist de seguranca

- Nao commitar `.env` ou `.env.local`; eles ja estao no `.gitignore`.
- Usar somente a chave `anon public` no frontend. Nunca usar `service_role` no projeto Next.
- Em Supabase > Authentication > Providers, deixe cadastro publico desativado se o painel for usado apenas pela Sabrina.
- Apenas usuarios listados em `public.admin_users` conseguem ler/editar clientes, agenda, caixa, gastos e feedbacks.
- Apenas usuarios listados em `public.admin_users` conseguem aprovar, recusar, destacar, editar ou excluir feedbacks.
- Visitantes anonimos so conseguem ler servicos ativos, feedbacks aprovados, enviar solicitacoes de horario e enviar feedbacks pendentes.
- As fotos de feedback sao comprimidas no navegador antes do upload e salvas no bucket `feedback-media`.

## Fluxo esperado

1. A cliente solicita horario em `/agendar`.
2. A Sabrina entra em `/admin`.
3. Ela aprova a solicitacao, que vira agendamento confirmado.
4. Quando marcar o agendamento como `Feito`, ele entra no caixa.
5. Gastos cadastrados entram no calculo de lucro estimado.
6. A cliente envia feedback no site.
7. A Sabrina aprova ou destaca o feedback em `/admin` > `Feedbacks`.
8. Somente feedbacks aprovados aparecem na secao `Depoimentos`.
