# Valet

Secure, extensible AI assistant with approvals and audit logs.

## Quickstart

1) Install deps and set up DB:
```bash
pnpm install
pnpm prisma:migrate
pnpm db:seed
```

2) Copy `.env.example` to `.env` and set keys.

3) Dev server:
```bash
pnpm dev
```

## Tour of Valet

- Chat with streamed responses and planned actions
- Approvals list with Approve/Reject actions
- Tool registry (email, calendar, notes, reminders, groceries, memory)
- Prisma models: User, AuditLog, Approval, ProviderToken, Memory, Task

## Testing

Unit tests:
```bash
pnpm test:unit
```

E2E tests (Playwright):
```bash
pnpm test:e2e
```

