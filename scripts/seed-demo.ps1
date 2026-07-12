$ErrorActionPreference = "Stop"
docker compose up -d postgres redis
npm run db:migrate
npm run db:seed

