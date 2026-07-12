$ErrorActionPreference = "Stop"
npm run db:generate
npm run lint
npm run typecheck
npm run test
npm run build

