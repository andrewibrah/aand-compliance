# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Express + Vite dev server on port 3000 (tsx watch)
pnpm check        # TypeScript type check (noEmit, covers client + server + shared)
pnpm test         # Vitest test suite
pnpm test -- --run scoring.test.ts  # Run a single test file
pnpm build        # Vite frontend build + esbuild server bundle → dist/
pnpm start        # Production (node dist/index.js)
pnpm format       # Prettier
pnpm db:push      # drizzle-kit generate + migrate (run after schema changes)
```

Vercel deployment:
```bash
pnpm run vercel-build   # Frontend-only build for Vercel static output (dist/public/)
```

## Architecture

This is a **compliance SaaS app** (FTC Safeguards Rule engine) for automotive dealerships. The stack is a monorepo with three source roots:

```
client/src/    React SPA (Vite, Tailwind, shadcn/radix)
server/        Express + tRPC backend
shared/        Constants shared between client and server
drizzle/       Schema (source of truth) + migration files
api/           Vercel serverless function entry points
```

### API Layer (tRPC)

All client–server communication goes through tRPC at `/api/trpc`. The router is assembled in `server/routers.ts` as `appRouter` and composed of inline routers and sub-routers (`pdfRouter`, `stripeRouter`, `systemRouter`).

Three procedure types defined in `server/_core/trpc.ts`:
- `publicProcedure` — no auth required
- `protectedProcedure` — requires authenticated user (`ctx.user !== null`), throws `UNAUTHORIZED`
- `adminProcedure` — requires `ctx.user.role === 'admin'`, throws `FORBIDDEN`

The tRPC context (`server/_core/context.ts`) hydrates `ctx.user` from the session cookie on every request.

### Auth

Session cookie name: `app_session_id` (defined in `shared/const.ts` as `COOKIE_NAME`). The cookie is an HS256 JWT signed with `JWT_SECRET`. Cookie options are in `server/_core/cookies.ts`. Auth utility functions (hash, verify, token sign/verify) live in `server/auth.ts`.

New users register via `POST /api/auth/signup`; existing users log in via `POST /api/auth/login`. The admin account is set at signup time: if `email === ADMIN_EMAIL` env var, `role` is set to `'admin'`.

### Database

Drizzle ORM with Vercel Postgres (`@vercel/postgres`). Schema is the single source of truth at `drizzle/schema.ts`. Five tables: `users`, `dealerships`, `complianceAnswers`, `subscriptions`, `generatedDocuments`. All DB functions are in `server/db.ts` and imported as `import * as db from './db'`.

Key upsert: `complianceAnswers` has a unique constraint on `(dealershipId, section)` and uses `onConflictDoUpdate`.

After any schema change: `pnpm db:push` to generate migration and apply it.

### File Storage

PDFs are stored in Vercel Blob (`@vercel/blob`) via `server/storage.ts`. The `storagePath` column in `generatedDocuments` stores the permanent blob URL. Download URLs are generated server-side with a short TTL (private access).

### LLM

`server/_core/llm.ts` exposes `invokeLLM(params)` which calls the OpenAI API (`gpt-4o-mini`) via plain `fetch`. The interface (`InvokeParams`, `InvokeResult`) follows the OpenAI chat completions shape. Used for gap narrative generation in compliance reports.

### Vercel Serverless Functions

`api/` contains Vercel entry points:
- `api/trpc/[trpc].ts` — tRPC Express adapter (handles all `/api/trpc/*`)
- `api/auth/login.ts` / `api/auth/signup.ts` — email/password auth
- `api/stripe/webhook.ts` — raw body required (`bodyParser: false`)

The auth handlers export both a named function (used by `server/_core/index.ts` for local dev) and a default export (used by Vercel).

### Client

Frontend routing uses `wouter`. The tRPC client is in `client/src/lib/trpc.ts`. Auth state is managed by the `useAuth` hook (`trpc.auth.me.useQuery()`). Path aliases: `@` → `client/src`, `@shared` → `shared`.

### Environment Variables

| Variable | Purpose |
|---|---|
| `POSTGRES_URL` | Auto-injected by Vercel Postgres integration |
| `JWT_SECRET` | Session JWT signing secret (min 32 chars) |
| `ADMIN_EMAIL` | Email that receives `role='admin'` at signup |
| `BLOB_READ_WRITE_TOKEN` | Auto-injected by Vercel Blob integration |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret |
| `STRIPE_CORE_PRICE_ID` | Stripe Price ID for Core plan |
| `STRIPE_MANAGED_PRICE_ID` | Stripe Price ID for Managed plan |
| `OPENAI_API_KEY` | LLM calls for gap analysis (`gpt-4o-mini`) |
| `VITE_APP_URL` | Public deployment URL (used in Stripe redirects) |
