# Contributing

Thanks for helping improve StadiumGPT AI.

## Development Standards

- Keep TypeScript strict and avoid `any` except where external platform APIs require it.
- Add tests for user-visible behavior, authorization rules, and AI safety workflows.
- Keep UI accessible by default: keyboard paths, ARIA labels, semantic HTML, visible focus, and WCAG AA contrast.
- Prefer feature folders and small services over broad utility modules.
- Never commit secrets, generated coverage, build output, or local `.env` files.

## Workflow

1. Create a branch from `main`.
2. Run `npm install`.
3. Run `npm run db:migrate` and `npm run db:seed`.
4. Make focused changes.
5. Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
6. Open a pull request with a short product summary, screenshots, test evidence, and risk notes.

