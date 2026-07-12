# StadiumGPT AI

The AI Operating System for FIFA World Cup 2026 smart stadiums. StadiumGPT AI brings fans, staff, volunteers, organizers, security, medical teams, accessibility teams, transport planners, and sustainability operators into one real-time command platform.

## What It Does

StadiumGPT AI combines a Next.js PWA, a NestJS API, PostgreSQL, Redis queues, Prisma, OpenAI-powered assistants, map intelligence, role-based dashboards, and operational analytics. It supports:

- Fan assistant for gates, seats, parking, food, washrooms, ticket questions, routes, schedules, and lost-and-found.
- Organizer AI for crowd summaries, queue prediction, staffing needs, cleaning, transport, and incident trends.
- Security AI for incident triage, evacuation guidance, crowd risk summaries, and emergency recommendations.
- Volunteer AI for assignments, translation, navigation, and incident reporting.
- Accessibility AI for wheelchair routing, speech recognition, text-to-speech, high-contrast UI, and accessible facilities.
- Sustainability AI for carbon footprint, waste analysis, transport emissions, and energy recommendations.

## Repository

```text
frontend/       Next.js PWA, dashboards, maps, AI chat, accessibility-first UI
backend/        NestJS API, Prisma, auth, AI modules, analytics, queues
database/       SQL migration, indexes, seedable normalized schema
docs/           Architecture, API, deployment, diagrams, screenshots notes
architecture/   Mermaid diagrams for judging and engineering review
tests/          Playwright E2E and accessibility checks
docker/         Production Dockerfiles
.github/        CI, test, build, and deployment workflows
scripts/        Developer automation helpers
assets/         Static design and submission assets
public/         Top-level public assets for hackathon packaging
```

## Quick Start

```bash
npm install
cp .env.example .env
docker compose up -d postgres redis
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend: http://localhost:3000  
Backend Swagger: http://localhost:4000/docs

Demo users created by the seed script:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@stadiumgpt.ai | StadiumGPT2026! |
| Fan | fan@stadiumgpt.ai | StadiumGPT2026! |
| Organizer | organizer@stadiumgpt.ai | StadiumGPT2026! |
| Security | security@stadiumgpt.ai | StadiumGPT2026! |
| Medical | medical@stadiumgpt.ai | StadiumGPT2026! |
| Volunteer | volunteer@stadiumgpt.ai | StadiumGPT2026! |

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

## Production Deployment

- Frontend: Vercel using `frontend/` as the project root.
- Backend: Railway using `docker/backend.Dockerfile` or `npm run start:prod -w backend`.
- Data: managed PostgreSQL and Redis.
- Secrets: set `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`, and `OPENAI_API_KEY` in the hosting provider.

## Security

The API applies Helmet, CORS allowlists, JWT authentication, role guards, request validation, throttling, structured logs, Prisma parameterization, password hashing, and audit logging. See [SECURITY.md](SECURITY.md).

## Documentation

- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Deployment](docs/deployment.md)
- [Testing](docs/testing.md)
- [Data Model](architecture/er-diagram.md)
- [Operational Flows](architecture/sequence-diagrams.md)

