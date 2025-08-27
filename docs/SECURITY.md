# Security

- OAuth via providers only. No password auth.
- PII and tokens stored server-side; never in client or logs.
- Append-only audit log, RBAC, CSRF protection via NextAuth.
- Approval required for irreversible or spend-money actions.
