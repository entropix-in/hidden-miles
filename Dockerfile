FROM node:26-bookworm-slim AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install --global pnpm@12.16.1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_SITE_URL
RUN pnpm build

FROM node:26-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/.next/standalone ./www
COPY --from=build --chown=node:node /app/.next/static ./www/.next/static
COPY --from=build --chown=node:node /app/public ./www/public
COPY --from=build /app/node_modules ./node_modules
COPY drizzle.config.ts ./
COPY drizzle ./drizzle

USER node
EXPOSE 3000
CMD ["sh", "-c", "if [ -n \"$DB_HOST\" ]; then ./node_modules/.bin/drizzle-kit migrate || exit; fi; exec node www/server.js"]
