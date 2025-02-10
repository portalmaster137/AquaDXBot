FROM oven/bun:slim

WORKDIR /app

COPY . .

RUN bun i

CMD [ "/bin/bash", "entrypoint.sh" ]