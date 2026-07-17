FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY backend/ ./backend/
COPY frontend/ ./frontend/
RUN npm run prisma:generate -w backend
RUN npm run build -w backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/package.json ./backend/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
RUN npm prune --omit=dev --workspace=backend
EXPOSE 4000
CMD ["node", "backend/dist/src/main.js"]
