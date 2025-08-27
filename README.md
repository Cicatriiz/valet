## Valet

Valet is a secure, extensible executive assistant with a clean web UI, approvals, and an audit trail. It can draft emails, manage calendars, take notes, create reminders, and build a demo groceries cart — with human approval before any irreversible action.

### Demo goals for reviewers

- See the chat experience and planned actions
- Approve an action (e.g., email send or calendar create) and see audit entries
- Optionally connect Google to list emails/events

---

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind
- Auth: NextAuth (Google)
- LLM: OpenAI (Responses API ready; mockable), server-side tool-calling
- ORM/DB: Prisma + SQLite (dev), Postgres in prod
- Tests: Vitest (unit), Playwright (E2E)

---

## Features

- Chat with SSE streaming and planned actions summary
- Approvals: irreversible/spend-money actions require explicit approval
- Audit Log: append-only records with timestamps and user IDs
- Tools (typed via zod):
  - email_list, email_draft, email_send (approval)
  - calendar_list, calendar_create (approval), calendar_update (approval)
  - notes_upsert (Notion adapter)
  - reminders_create
  - groceries_build_cart, groceries_checkout (approval), groceries_link
  - memory_read, memory_write
- Integrations:
  - Google Gmail/Calendar via NextAuth Google account
  - Notion via NOTION_TOKEN (optional)
  - Demo Groceries provider

---

## Repo Structure

```
app/                  # UI (App Router)
  api/                # Route handlers (agent, approvals, user/openai)
  chat, approvals, settings, tasks
components/ui/        # Design system (Card, Badge, Input, etc.)
server/agent/         # Tools, router, services, approvals, audit
server/llm/           # Prompt and OpenAI client (user-key aware)
prisma/               # Prisma schema & migrations
packages/shared/      # Shared types & zod wrappers
tests/                # Vitest unit & Playwright e2e
scripts/              # seed script, helper scripts
docs/                 # Additional documentation
```

---

## Environment

Copy `.env.example` to `.env` and set the following:

- NEXTAUTH_URL
- NEXTAUTH_SECRET
- DATABASE_URL (SQLite dev; Postgres in prod)
- USE_MOCK_LLM (true for demo without OpenAI)
- OPENAI_API_KEY (fallback if user key not set)
- ENCRYPTION_KEY (>=32 chars) for user-secret encryption
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (optional, for Gmail/Calendar)
- NOTION_TOKEN (optional) and NOTION_DEFAULT_DATABASE_ID (optional)
- GROCERIES_DEMO=true

User-specific OpenAI keys are stored encrypted in the `Secret` table.

---

## Development

```bash
pnpm install
pnpm prisma:migrate
pnpm db:seed
pnpm dev
```

Run at `http://localhost:3030` (Playwright webServer). If you run `pnpm dev` without Playwright, it defaults to 3000.

---

## Testing

```bash
pnpm test:unit   # Vitest
pnpm test:e2e    # Playwright (auto-starts dev server on 3030)
```

---

## Approvals & Audit

- Tools can be flagged `requiresApproval`. The agent creates a Pending approval with a human-readable summary.
- Approvals UI lists pending items with Approve/Reject buttons.
- On approval, the tool’s `execute` handler runs and writes to the `AuditLog`.

---

## Integrations

- Google: Connect via Settings → Google → Connect (NextAuth). Then `email_list`/`calendar_list` will return live data.
- Notion: Set `NOTION_TOKEN` (and optional default DB) in env to enable `notes_upsert` into Notion.
- Groceries: Demo provider returns mock prices and a shareable link; checkout requires approval.

---

## Deployment (Vercel + Neon Postgres)

1) Create a Neon Postgres and copy the connection string
2) Push the repo to GitHub
3) Vercel → New Project → Import repo
4) Set env vars (Production & Preview):
   - NEXTAUTH_URL: https://<project>.vercel.app
   - NEXTAUTH_SECRET: long random string
   - DATABASE_URL: Neon connection string
   - USE_MOCK_LLM: true (or provide OPENAI_API_KEY and ENCRYPTION_KEY)
   - GROCERIES_DEMO: true
   - Optional: GOOGLE_CLIENT_ID/SECRET, NOTION_TOKEN
5) Deploy

If the DB is fresh, run migrations (either via Vercel Postgres integration or locally against the prod DB):

```bash
DATABASE_URL="<prod-url>" pnpm prisma migrate deploy
```

---

## Security

- No secrets in client or logs; user API keys encrypted at rest
- Idempotent, audit-logged actions
- Approval-gated irreversible/spend actions
- Strict TypeScript + zod validation at all edges

---

## Troubleshooting

- Port in use: kill process on 3030 or set a different port
- If Prisma types lag after migrations, re-run `pnpm prisma generate`
- Clear Next cache on odd dev errors: remove `.next` and restart

