# Deploy

Valet requires a Node runtime for API routes (SSE chat, approvals, NextAuth) and a database. Static hosts like GitHub Pages cannot run these server features.

Recommended options:

1) Vercel (easiest)
2) Render / Railway / Fly.io (Node + Postgres)
3) Self-hosted Docker (any VM) with Postgres

---

## Vercel (Dashboard)

1. Push the repo to GitHub
2. In Vercel, New Project → Import this repo
3. Set env vars (Production & Preview):
   - NEXTAUTH_URL: https://<project>.vercel.app
   - NEXTAUTH_SECRET: long random string
   - DATABASE_URL: Neon (or other Postgres) connection string
   - USE_MOCK_LLM: true (or provide OPENAI_API_KEY and ENCRYPTION_KEY)
   - GROCERIES_DEMO: true
   - Optional: GOOGLE_CLIENT_ID/SECRET, NOTION_TOKEN
4. Deploy
5. Run migrations against prod if needed:
```bash
DATABASE_URL="<prod-url>" pnpm prisma migrate deploy
```

## Vercel (CLI)

Locally, with a Vercel account:
```bash
pnpm dlx vercel@latest login
# Optionally: export VERCEL_TOKEN=... for non-interactive

pnpm dlx vercel@latest link --yes
pnpm dlx vercel@latest env pull .env.local || true

# Deploy
pnpm dlx vercel@latest --prod --confirm
```

Alternatively, use the package script:
```bash
pnpm deploy:vercel
```

## GitHub Pages

GitHub Pages serves static files only and cannot run Next.js API routes, SSE, or NextAuth. If you need a static demo, you would have to export a reduced, client-only build (no auth, no server tools), which is not representative of Valet’s capabilities. Prefer Vercel/Render/Railway for a live demo.

## GitHub Actions (CI → Vercel)

You can deploy automatically on push using Vercel’s GitHub App or a workflow that runs `vercel --prod` with `VERCEL_TOKEN`.

