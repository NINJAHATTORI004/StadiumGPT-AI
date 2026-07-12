# Deployment Guide

## Infrastructure

- Vercel for `frontend/`.
- Railway or any container platform for `backend/`.
- Managed PostgreSQL 16+.
- Managed Redis 7+.

## Environment

Set every variable from `.env.example`. Production secrets must come from the platform secret manager.

## Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

For production, run migrations in a release phase before starting the API.

## Docker

```bash
docker compose up --build
```

The frontend serves on port `3000`; the backend serves on port `4000`.

