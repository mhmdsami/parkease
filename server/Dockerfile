FROM oven/bun AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

ENV NODE_ENV production
ARG PORT
ARG DATABASE_URL

EXPOSE ${PORT}

CMD bun run db:migrate && bun src/index.ts
