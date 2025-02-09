FROM oven/bun:slim

WORKDIR /app

COPY . .

RUN bun i

ENTRYPOINT [ "bun", "/app/src/index.ts" ]