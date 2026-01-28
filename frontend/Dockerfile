FROM oven/bun:latest

WORKDIR /app

COPY frontend/package*.json ./
COPY frontend/bun.lock ./
RUN bun install

COPY frontend/ ./

EXPOSE 5173

CMD ["bun", "run", "dev", "--", "--host"]